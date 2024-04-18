import * as dotenv from 'dotenv'
import {
  CookieOptions,
  Request as ExRequest,
  Response as ExResponse,
} from 'express'

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBadGatewayResponse,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiParamOptions,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import { RegisterTokenJwtStrategy } from '@spaps/modules/core-module/register.token.jwt.strategy'
import { PasswordRestorationTokenJwtStrategy } from '@spaps/modules/core-module/restore.password.token.jwt.strategy'
import { User } from '@spaps/modules/core-module/user/user.entity'
import { UserService } from '@spaps/modules/core-module/user/user.service'

import { PasswordRestoringUser, RegisteredUser } from '@spaps/core/decorators'
import { ApiV1, CError, Nullable, convertType } from '@spaps/core/utils'

import { AuthService } from './auth.service'
import {
  LoginDto,
  RegisterUserDto,
  RestorePasswordDto,
  SetPasswordDto,
} from './dto'

dotenv.config()

type TSameSite = 'lax' | 'strict' | 'none' | boolean
type THttpOnly = boolean | undefined
type TSecure = boolean | undefined
type TPath = string | undefined
type TDomain = string | undefined

@ApiTags('Users')
@ApiBadGatewayResponse({
  status: 502,
  description: 'Something went wrong',
})
@Controller(ApiV1('users'))
export class AuthController {
  constructor(
    readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  private getExpirationDay = (dayNumber) => {
    const nextDay = new Date()
    nextDay.setDate(new Date().getDate() + parseInt(dayNumber))

    return nextDay
  }

  private cookieConfig: CookieOptions = {
    httpOnly: convertType(process.env.COOKIE_TOKEN_HTTP_ONLY) as THttpOnly,
    sameSite: process.env.COOKIE_TOKEN_SAME_SITE as TSameSite,
    secure: convertType(process.env.COOKIE_TOKEN_SECURE) as TSecure,
    path: convertType(process.env.COOKIE_TOKEN_PATH) as TPath, //TODO: double-check on clear config on staging
    domain: convertType(process.env.COOKIE_TOKEN_DOMAIN) as TDomain,
  }

  private registrationCookieConfig: CookieOptions = {
    ...this.cookieConfig,
    expires: this.getExpirationDay(process.env.REGISTRATION_DAY_NUMBER),
  }

  private passwordRestorationCookieConfig: CookieOptions = {
    ...this.cookieConfig,
    expires: this.getExpirationDay(process.env.PASSWORD_RESTORATION_DAY_NUMBER),
  }

  private loginCookieConfig: CookieOptions = {
    ...this.cookieConfig,
    expires: this.getExpirationDay(process.env.AUTH_TOKEN_DAY_NUMBER),
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register new non-admin user.',
  })
  @ApiBody({
    description: 'Model to register a new non-admin user.',
    type: RegisterUserDto,
  })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Will return boolean value. If true, it means the confirmation code was sent to the email.',
  //   type: Boolean,
  // })
  @ApiResponse({
    status: 200,
    description: 'Will return the confirmation code.',
    type: Number,
  })
  async register(@Body() data: RegisterUserDto): Promise<string> {
    return this.authService.register(data)
  }

  @Get('confirm-registration-code/:code')
  @ApiOperation({
    summary: 'Get registration confirmation code.',
  })
  @ApiParam({
    name: 'code',
    type: 'string',
    example: '12345',
  } as ApiParamOptions)
  @ApiResponse({
    status: 200,
    description:
      'Will return a boolean value if the code corresponds to any currently kept registration data in temporary db.',
    type: Boolean,
  })
  async confirmRegistrationCode(
    @Param('code') code: string,
    @Res({ passthrough: true }) response: ExResponse,
  ): Promise<boolean> {
    const registrationToken = await this.authService.confirmCode({ code })

    try {
      response.cookie(
        process.env.REGISTRATION_TOKEN_NAME,
        registrationToken,
        this.registrationCookieConfig,
      )

      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  @Post('set-password')
  @UseGuards(RegisterTokenJwtStrategy)
  @ApiOperation({
    summary: 'Set password.',
  })
  @ApiBody({
    description: 'Model to set password.',
    type: SetPasswordDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Will return the boolean value.',
    type: Boolean,
  })
  async setPassword(
    @RegisteredUser() registeredUser: Partial<User>,
    @Body() data: SetPasswordDto,
    @Req() request: ExRequest,
    @Res({ passthrough: true }) response: ExResponse,
  ): Promise<User> {
    let hasRegisterToken = Boolean(
      request?.['cookies']?.[process.env.REGISTRATION_TOKEN_NAME],
    )

    if (!hasRegisterToken) {
      throw new HttpException(CError.NO_REGISTER_TOKEN, HttpStatus.BAD_REQUEST)
    }

    const user = await this.userService.createUser({
      ...data,
      ...registeredUser,
    })

    response.clearCookie(process.env.REGISTRATION_TOKEN_NAME, this.cookieConfig)

    return user
  }

  @Get('password-reset-email/:email')
  @ApiOperation({
    summary: 'Get email for password reset.',
  })
  @ApiParam({
    name: 'email',
    type: 'string',
    example: 'test@gmail.com',
  } as ApiParamOptions)
  // @ApiResponse({
  //   status: 200,
  //   description: 'Will return boolean value. If true, it means the confirmation code was sent to the email.',
  //   type: Boolean,
  // })
  @ApiResponse({
    status: 200,
    description: 'Will return the confirmation code.',
    type: Number,
  })
  async getPasswordResetEmail(@Param('email') email: string): Promise<string> {
    return this.authService.getPasswordResetEmail({
      email,
    })
  }

  @Post('password-reset-confirm-code/:code')
  @ApiOperation({
    summary: 'Get email for password reset.',
  })
  @ApiParam({
    name: 'code',
    type: 'string',
    example: '12345',
  } as ApiParamOptions)
  @ApiResponse({
    status: 200,
    description: 'Will return the password restoration code.',
    type: Boolean,
  })
  async getPasswordResetConfirmCode(
    @Param('code') code: string,
    @Body() { email }: RestorePasswordDto,
    @Res({ passthrough: true }) response: ExResponse,
  ): Promise<boolean> {
    const passwordRestorationToken =
      await this.authService.getPasswordResetConfirmCode({ email, code })

    try {
      response.cookie(
        process.env.PASSWORD_RESTORATION_TOKEN_NAME,
        passwordRestorationToken,
        this.passwordRestorationCookieConfig,
      )

      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  @Post('password-reset')
  @UseGuards(PasswordRestorationTokenJwtStrategy)
  @ApiOperation({
    summary: 'Reset password.',
  })
  @ApiBody({
    description: 'Model to reset password.',
    type: SetPasswordDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Will return the boolean value.',
    type: Boolean,
  })
  async resetPassword(
    @PasswordRestoringUser() passwordRestoringUser: Partial<User>,
    @Body() data: SetPasswordDto,
    @Req() request: ExRequest,
    @Res({ passthrough: true }) response: ExResponse,
  ): Promise<User> {
    let hasPasswordRestoringToken = Boolean(
      request?.['cookies']?.[process.env.PASSWORD_RESTORATION_TOKEN_NAME],
    )

    if (!hasPasswordRestoringToken) {
      throw new HttpException(CError.NO_REGISTER_TOKEN, HttpStatus.BAD_REQUEST)
    }

    const user = await this.userService.updateUser({
      ...data,
      ...passwordRestoringUser,
    })

    response.clearCookie(
      process.env.PASSWORD_RESTORATION_TOKEN_NAME,
      this.cookieConfig,
    )

    return user
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Login by email and password.',
  })
  @ApiBody({
    description: 'Model for Login by email and password.',
    type: LoginDto,
  })
  @ApiResponse({
    status: 200,
    description: 'This will return the access token in cookies.',
    type: User,
  })
  async loginByPhoneAndPassword(
    @Body() { email, password }: LoginDto,
    @Res({ passthrough: true }) response: ExResponse,
  ): Promise<Nullable<User>> {
    const {
      accessToken,
      user,
    }: {
      accessToken: string
      user: User
    } = await this.authService.login({
      email,
      password,
    })

    response.cookie(
      process.env.COOKIE_TOKEN_NAME,
      accessToken,
      this.loginCookieConfig,
    )

    return user
  }

  @Get('logout')
  @ApiOperation({
    summary: 'Logout.',
  })
  @ApiResponse({
    status: 200,
    description: `This returns "true" if logout was successful`,
    type: Boolean,
  })
  logout(
    @Req() request: ExRequest,
    @Res({ passthrough: true }) response: ExResponse,
  ) {
    let hasToken = Boolean(
      request?.['cookies']?.[process.env.COOKIE_TOKEN_NAME],
    )

    if (!hasToken) {
      throw new HttpException(CError.NO_TOKEN, HttpStatus.BAD_REQUEST)
    }

    try {
      response.clearCookie(process.env.COOKIE_TOKEN_NAME, this.cookieConfig)
    } catch (e) {
      hasToken = false
    }

    return hasToken
  }
}
