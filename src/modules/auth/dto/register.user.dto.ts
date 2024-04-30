import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'
import * as dotenv from 'dotenv'

import { ApiProperty } from '@nestjs/swagger'

import { ENonAdminRole } from '@spaps/core/enums'
import { LATIN_CYRILLIC_LETTER_NAME_REGEX } from '@spaps/core/utils'

dotenv.config()

export class RegisterUserDto {
  @IsString()
  @MaxLength(parseInt(process.env.MAX_FIRST_NAME_LENGTH))
  @MinLength(1)
  @IsNotEmpty()
  @Matches(LATIN_CYRILLIC_LETTER_NAME_REGEX)
  @ApiProperty({
    example: 'John',
    description: 'Enter first name.',
    type: String,
  })
  readonly firstName: string

  @IsString()
  @MaxLength(parseInt(process.env.MAX_LAST_NAME_LENGTH))
  @MinLength(1)
  @IsNotEmpty()
  @Matches(LATIN_CYRILLIC_LETTER_NAME_REGEX)
  @ApiProperty({
    example: 'Johnson',
    description: 'Enter first name.',
    type: String,
  })
  readonly lastName: string

  @IsString()
  @IsEmail()
  @MaxLength(parseInt(process.env.MAX_EMAIL_LENGTH))
  @ApiProperty({
    example: 'test@gmail.com',
    description: 'Enter the email address.',
    type: String,
  })
  readonly email: string

  @IsString()
  @IsEnum(ENonAdminRole)
  @ApiProperty({
    example: ENonAdminRole.CLIENT,
    description: 'Enter non-admin role:.',
    type: String,
  })
  readonly role: ENonAdminRole
}
