import * as bcrypt from 'bcrypt'
import { Cache } from 'cache-manager'

import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { User } from '@spaps/modules/core-module/user/user.entity'
import { UserService } from '@spaps/modules/core-module/user/user.service'
import { TaskService } from '@spaps/modules/task/task.service'

import { EEmailVariant, ENonAdminRole } from '@spaps/core/enums'
import {
  CError,
  Nullable,
  findWrongEnumValue,
  generateFiveRandomDigits,
} from '@spaps/core/utils'

import { LoginDto, RegisterUserDto } from './dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly taskService: TaskService,
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
  }: RegisterUserDto): Promise<boolean> {
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
        CError.IS_CONFIRMATION_CODE_TOO_SOON,
        HttpStatus.BAD_REQUEST,
      )
    }

    try {
      const fiveDigitCode = await this.getNewFiveRandomDigits()
      const value = JSON.stringify({ firstName, lastName, email, role })
      await Promise.all([
        this.cacheManager.set(fiveDigitCode, value, 900000), //NOTE: 15 mins
        this.cacheManager.set(email, email, 60000), //NOTE: 1 min
      ])

      this.taskService.addSendCodeTask({
        code: fiveDigitCode,
        variant: EEmailVariant.EMAIL_REGISTRATION,
        email,
        firstName,
        lastName,
      })

      return true
    } catch {
      return false
    }
  }

  async confirmCode({ code }: { code: string }): Promise<string> {
    const jsonValue = (await this.cacheManager.get(code)) as unknown as string

    if (!jsonValue) {
      throw new HttpException(
        CError.WRONG_CONFIRMATION_CODE,
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

  async getPasswordResetEmail({ email }: { email: string }) {
    const [foundUser, createdLastKeyWithinMinute]: [
      Nullable<User>,
      Nullable<string>,
    ] = await Promise.all([
      this.userService.findUserByEmail(email),
      this.cacheManager.get(email) as unknown as Nullable<string>,
    ])

    if (!foundUser) {
      throw new HttpException(CError.USER_NOT_FOUND, HttpStatus.BAD_REQUEST)
    }

    if (createdLastKeyWithinMinute) {
      throw new HttpException(
        CError.IS_CONFIRMATION_CODE_TOO_SOON,
        HttpStatus.BAD_REQUEST,
      )
    }

    try {
      const fiveDigitCode = await this.getNewFiveRandomDigits()
      const value = JSON.stringify({ email, id: foundUser.id })

      await Promise.all([
        this.cacheManager.set(fiveDigitCode, value, 900000), //NOTE: 15 mins
        this.cacheManager.set(email, email, 60000), //NOTE: 1 min
      ])

      this.taskService.addSendCodeTask({
        code: fiveDigitCode,
        variant: EEmailVariant.PASSWORD_CHANGE,
        email,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
      })

      return true
    } catch {
      return false
    }
  }

  async getPasswordResetConfirmCode({
    email,
    code,
  }: {
    email: string
    code: string
  }) {
    const jsonValue = (await this.cacheManager.get(code)) as unknown as string

    if (!jsonValue) {
      throw new HttpException(
        CError.WRONG_CONFIRMATION_CODE,
        HttpStatus.BAD_REQUEST,
      )
    }

    const jsonParsedValue = JSON.parse(jsonValue)
    const { id, email: storedEmail } = jsonParsedValue

    if (!id || storedEmail !== email) {
      throw new HttpException(
        CError.WRONG_CONFIRMATION_CODE,
        HttpStatus.BAD_REQUEST,
      )
    }

    const passwordRestorationToken: string = await this.jwtService.sign(
      {
        passwordRestorationData: Buffer.from(jsonValue).toString('base64'),
      },
      {
        expiresIn: process.env.PASSWORD_RESTORATION_TOKEN_EXPIRATION,
      },
    )

    return passwordRestorationToken
  }

  async login({
    email,
    password,
  }: LoginDto): Promise<{ accessToken: string; user: User }> {
    const foundUser: User | null = await this.userService.findUserByEmail(email)

    if (!foundUser) {
      throw new HttpException(CError.EMAIL_NOT_FOUND, HttpStatus.BAD_REQUEST)
    }

    const matchPasswords = await bcrypt.compare(password, foundUser.password)

    if (!matchPasswords) {
      throw new HttpException(CError.WRONG_PASSWORD, HttpStatus.BAD_REQUEST)
    }

    const accessToken = await this.jwtService.sign(
      {
        id: foundUser.id,
      },
      {
        expiresIn: process.env.AUTH_TOKEN_EXPIRATION,
      },
    )

    return {
      accessToken,
      user: foundUser,
    }
  }
}
