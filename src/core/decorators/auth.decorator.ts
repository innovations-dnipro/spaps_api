import { UseGuards, applyDecorators } from '@nestjs/common'
import { ApiUnauthorizedResponse } from '@nestjs/swagger'

import { JwtStrategy } from '@spaps/modules/core-module/jwt.strategy'

import { Roles } from '@spaps/core/decorators/roles.decorator'
import { ERole } from '@spaps/core/enums'
import { RolesGuard } from '@spaps/core/guards'

export function Auth({ roles }: { roles: ERole[] }) {
  return applyDecorators(
    Roles(roles),
    UseGuards(JwtStrategy, RolesGuard),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  )
}
