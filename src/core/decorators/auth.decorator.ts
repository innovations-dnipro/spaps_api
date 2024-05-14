import { UseGuards, applyDecorators } from '@nestjs/common'
import { ApiUnauthorizedResponse } from '@nestjs/swagger'

import { JwtStrategy } from '../core-module/jwt.strategy'
import { Roles } from '../decorators/roles.decorator'
import { ERole } from '../enums/roles'
import { RolesGuard } from '../guards/roles.guard'

export function Auth({ roles }: { roles: ERole[] }) {
  return applyDecorators(
    Roles(roles),
    UseGuards(JwtStrategy, RolesGuard),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  )
}
