import { ExecutionContext, createParamDecorator } from '@nestjs/common'

export const PasswordRestoringUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()

    return request.passwordRestoringUser
  },
)
