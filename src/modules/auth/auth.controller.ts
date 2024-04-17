import {
  CookieOptions,
  Request as ExRequest,
  Response as ExResponse,
} from 'express'

import {
  Body,
  Controller,
  Get,
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
import {
  CreateUserDto,
  SetPasswordDto,
} from '@spaps/modules/core-module/user/dto'
import { User } from '@spaps/modules/core-module/user/user.entity'
import { UserService } from '@spaps/modules/core-module/user/user.service'

import { RegisteredUser } from '@spaps/core/decorators'
import { ApiV1, CError, convertType } from '@spaps/core/utils'

import { AuthService } from './auth.service'

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

  /**
   * TODO LIST:
   *
   * + POST   /register
   * + GET   /confirm-registration-code
   * + POST   /set-password
   *
   * GET    /password-reset-email
   * GET   /password-reset-confirm-code
   * POST   /password-reset
   *
   * POST   /login
   */

  private getOneWeek = () => {
    const oneWeek = new Date()
    oneWeek.setDate(new Date().getDate() + 7)

    return oneWeek
  }

  private registrationCookieConfig: CookieOptions = {
    httpOnly: convertType(process.env.COOKIE_TOKEN_HTTP_ONLY) as THttpOnly,
    sameSite: process.env.COOKIE_TOKEN_SAME_SITE as TSameSite,
    secure: convertType(process.env.COOKIE_TOKEN_SECURE) as TSecure,
    expires: this.getOneWeek(),
    path: convertType(process.env.COOKIE_TOKEN_PATH) as TPath,
    domain: convertType(process.env.COOKIE_TOKEN_DOMAIN) as TDomain,
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register new non-admin user.',
  })
  @ApiBody({
    description: 'Model to register a new non-admin user.',
    type: CreateUserDto,
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
  async register(@Body() data: CreateUserDto): Promise<string> {
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

    const user = await this.userService.setPassword(data, registeredUser)

    response.clearCookie(process.env.REGISTRATION_TOKEN_NAME, {
      httpOnly: this.registrationCookieConfig.httpOnly,
      secure: this.registrationCookieConfig.secure,
      sameSite: this.registrationCookieConfig.sameSite,
      domain: this.registrationCookieConfig.domain,
    })

    return user
  }
}
