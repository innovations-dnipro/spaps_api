import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { Roles } from '../decorators/roles.decorator'
import { ERole } from '../enums/roles'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private matchRoles(roles: ERole[], userRole: ERole) {
    const includesRole = (roles || []).includes(userRole)

    if (!includesRole) {
      throw new UnauthorizedException(
        'Wrong role',
        "This endpoint is not accessible for the user's role.",
      )
    }

    return true
  }

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler())

    if (!Array.isArray(roles)) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    return this.matchRoles(roles, user.role)
  }
}
