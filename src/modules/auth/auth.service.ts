import { Cache } from 'cache-manager'

import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { User } from '@spaps/modules/core-module/user/user.entity'
import { UserService } from '@spaps/modules/core-module/user/user.service'

import { ENonAdminRole } from '@spaps/core/enums'
import {
  CError,
  Nullable,
  findWrongEnumValue,
  generateFiveRandomDigits,
} from '@spaps/core/utils'

import { CreateUserDto } from '../core-module/user/dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getNewFiveRandomDigits(): Promise<string> {
    const key: string = String(generateFiveRandomDigits())
    const value: Nullable<string> = await this.cacheManager.get(key)

    if (value) {
      return this.getNewFiveRandomDigits()
    }

    return key
  }

  async register({
    email,
    firstName,
    lastName,
    role,
  }: CreateUserDto): Promise<string> {
    const [foundUserByEmail, wrongRole, createdLastKeyWithinMinute]: [
      Nullable<User>,
      Nullable<string>,
      Nullable<string>,
    ] = await Promise.all([
      this.userService.findUserByEmail(email),
      findWrongEnumValue({
        $enum: ENonAdminRole,
        value: role,
      }),
      this.cacheManager.get(email) as unknown as Nullable<string>,
    ])

    if (foundUserByEmail) {
      throw new HttpException(
        CError.EMAIL_ALREADY_EXISTS,
        HttpStatus.BAD_REQUEST,
      )
    }

    if (wrongRole) {
      throw new HttpException(CError.WRONG_ENUM, HttpStatus.BAD_REQUEST)
    }

    if (createdLastKeyWithinMinute) {
      throw new HttpException(
        CError.IS_REGISTER_CONFIRMATION_CODE_TOO_SOON,
        HttpStatus.BAD_REQUEST,
      )
    }

    const fiveDigitCode = await this.getNewFiveRandomDigits()
    const value = JSON.stringify({ firstName, lastName, email, role })
    await Promise.all([
      this.cacheManager.set(fiveDigitCode, value, 900000), //NOTE: 15 mins
      this.cacheManager.set(email, email, 60000), //NOTE: 1 min
    ])

    return fiveDigitCode
  }

  async confirmCode({ code }: { code: string }): Promise<string> {
    const jsonValue = (await this.cacheManager.get(code)) as unknown as string

    if (!jsonValue) {
      throw new HttpException(
        CError.WRONG_REGISTER_CONFIRMATION_CODE,
        HttpStatus.BAD_REQUEST,
      )
    }

    const registrationToken: string = await this.jwtService.sign(
      {
        registerData: Buffer.from(jsonValue).toString('base64'),
      },
      {
        expiresIn: process.env.REGISTRATION_TOKEN_EXPIRATION,
      },
    )

    return registrationToken
  }
}
