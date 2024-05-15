import { Reflector } from '@nestjs/core'

import { ERole } from '../enums/roles'

export const Roles = Reflector.createDecorator<ERole[]>()
