import * as bcrypt from 'bcrypt'
import { Cache } from 'cache-manager'

import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { Client } from '@spaps/modules/client/client.entity'
import { ClientService } from '@spaps/modules/client/client.service'
import { Rentor } from '@spaps/modules/rentor/rentor.entity'
import { RentorService } from '@spaps/modules/rentor/rentor.service'
import { TaskService } from '@spaps/modules/task/task.service'

import { User } from '@spaps/core/core-module/user/user.entity'
import { UserService } from '@spaps/core/core-module/user/user.service'
import { EEmailVariant, ENonAdminRole, ERole } from '@spaps/core/enums'
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
    private readonly clientService: ClientService,
    private readonly rentorService: RentorService,
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
    const foundUser: User | null =
      await this.userService.findUserByEmailWithRelations(email)

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

  async createUser(user: Partial<User>): Promise<User> {
    let rentor: Nullable<Partial<Rentor>>
    let client: Nullable<Partial<Client>>

    const createdUser = await this.userService.createUser(user)

    if (user.role === ERole.CLIENT) {
      client = await this.clientService.createClient(createdUser)
    }

    if (user.role === ERole.RENTOR) {
      rentor = await this.rentorService.createRentor(createdUser)
    }

    return {
      ...createdUser,
      ...(client ? { clients: [client as Client] } : {}),
      ...(rentor ? { rentors: [rentor as Rentor] } : {}),
    }
  }

  async getPersonalData(userId: number): Promise<User> {
    return this.userService.findUserByIdWithRelations(userId)
  }

  async changeEmail({
    id,
    email,
  }: {
    id: number
    email: string
  }): Promise<number> {
    const [foundUserByEmail, foundUserById]: [Nullable<User>, Nullable<User>] =
      await Promise.all([
        this.userService.findUserByEmail(email),
        this.userService.findUserById(id),
      ])

    if (foundUserByEmail) {
      throw new HttpException(
        CError.EMAIL_ALREADY_EXISTS,
        HttpStatus.BAD_REQUEST,
      )
    }

    if (!foundUserById) {
      throw new HttpException(CError.USER_NOT_FOUND, HttpStatus.BAD_REQUEST)
    }

    const { firstName, lastName } = foundUserById
    const fiveDigitCode = await this.getNewFiveRandomDigits()
    const value = JSON.stringify({ id, email })
    await this.cacheManager.set(fiveDigitCode, value, 900000) //NOTE: 15 mins

    this.taskService.addSendCodeTask({
      code: fiveDigitCode,
      variant: EEmailVariant.EMAIL_CHANGE,
      email,
      firstName,
      lastName,
    })

    return 200
  }

  async confirmEmailChangeCode({
    id,
    code,
  }: {
    id: number
    code: string
  }): Promise<User> {
    const jsonValue = (await this.cacheManager.get(code)) as unknown as string

    if (!jsonValue) {
      throw new HttpException(
        CError.WRONG_CONFIRMATION_CODE,
        HttpStatus.BAD_REQUEST,
      )
    }

    const { id: savedId, email } = JSON.parse(jsonValue)

    if (id !== savedId) {
      throw new HttpException(
        CError.WRONG_CONFIRMATION_CODE,
        HttpStatus.BAD_REQUEST,
      )
    }

    return this.userService.updateUser({ id, email })
  }
}
