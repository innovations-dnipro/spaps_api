import { IsEmail, IsString, MaxLength } from 'class-validator'
import * as dotenv from 'dotenv'

import { ApiProperty } from '@nestjs/swagger'

dotenv.config()

export class RestorePasswordDto {
  @IsString()
  @IsEmail()
  @MaxLength(parseInt(process.env.MAX_EMAIL_LENGTH))
  @ApiProperty({
    example: 'test@gmail.com',
    description: 'Enter the email address.',
    type: String,
  })
  readonly email: string
}
