import { Reflector } from '@nestjs/core'

import { ERole } from '../enums'

export const Roles = Reflector.createDecorator<ERole[]>()
