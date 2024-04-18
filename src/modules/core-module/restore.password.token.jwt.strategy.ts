import * as dotenv from 'dotenv'
import { Request } from 'express'
import { JwtPayload } from 'jsonwebtoken'

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Scope,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

dotenv.config()

@Injectable({ scope: Scope.REQUEST })
export class PasswordRestorationTokenJwtStrategy implements CanActivate {
  constructor(
    private config: ConfigService,
    private jwtService: JwtService,
  ) {}

  private extractTokenFromHeader(request: Request): string | undefined {
    const passwordRestorationToken: string =
      request?.['cookies']?.[process.env.PASSWORD_RESTORATION_TOKEN_NAME]

    return passwordRestorationToken
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()
    const passwordRestorationToken: string =
      this.extractTokenFromHeader(request)

    if (!passwordRestorationToken) {
      throw new UnauthorizedException()
    }

    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(
        passwordRestorationToken,
        {
          secret: this.config.get(process.env.AUTH_TOKEN_SECRET),
        },
      )

      const { passwordRestorationData } = payload
      const jsonPasswordRestorationData = Buffer.from(
        passwordRestorationData,
        'base64',
      ).toString()
      const parsedPasswordRestorationData = JSON.parse(
        jsonPasswordRestorationData,
      )

      request['passwordRestoringUser'] = parsedPasswordRestorationData
    } catch {
      throw new UnauthorizedException()
    }

    return true
  }
}
