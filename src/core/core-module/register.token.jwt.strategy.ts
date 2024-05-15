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
export class RegisterTokenJwtStrategy implements CanActivate {
  constructor(
    private config: ConfigService,
    private jwtService: JwtService,
  ) {}

  private extractTokenFromHeader(request: Request): string | undefined {
    const registertoken: string =
      request?.['cookies']?.[process.env.REGISTRATION_TOKEN_NAME]

    return registertoken
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()
    const registerToken: string = this.extractTokenFromHeader(request)

    if (!registerToken) {
      throw new UnauthorizedException()
    }

    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(
        registerToken,
        {
          secret: this.config.get(process.env.AUTH_TOKEN_SECRET),
        },
      )

      const { registerData } = payload
      const jsonRegisterData = Buffer.from(registerData, 'base64').toString()
      const parsedRegisterData = JSON.parse(jsonRegisterData)

      request['registeredUser'] = parsedRegisterData
    } catch {
      throw new UnauthorizedException()
    }

    return true
  }
}
