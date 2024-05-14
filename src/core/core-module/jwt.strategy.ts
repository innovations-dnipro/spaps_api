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

import { User } from './user/user.entity'
import { UserService } from './user/user.service'

@Injectable({ scope: Scope.REQUEST })
export class JwtStrategy implements CanActivate {
  constructor(
    private config: ConfigService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  private extractTokenFromHeader(request: Request): string | undefined {
    const token: string = request?.['cookies']?.[process.env.COOKIE_TOKEN_NAME]

    return token
  }

  private async validate(payload: JwtPayload): Promise<User> {
    const id: number = parseInt(payload.id)
    const user: User = await this.userService.findUserById(id)

    if (!user) {
      throw new UnauthorizedException()
    }

    return user
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()
    const token: string = this.extractTokenFromHeader(request)

    if (!token) {
      throw new UnauthorizedException()
    }

    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get(process.env.AUTH_TOKEN_SECRET),
      })

      request['user'] = await this.validate(payload)
    } catch {
      throw new UnauthorizedException()
    }

    return true
  }
}
