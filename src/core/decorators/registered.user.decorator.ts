import { ExecutionContext, createParamDecorator } from '@nestjs/common'

export const RegisteredUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()

    return request.registeredUser
  },
)
