import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'
import * as dotenv from 'dotenv'

import { ApiProperty } from '@nestjs/swagger'

dotenv.config()

export class PostPasswordDto {
  @IsString()
  @MaxLength(15)
  @MinLength(6)
  @IsNotEmpty()
  @ApiProperty({
    example: '123Abc!_z',
    description: 'Enter password.',
    type: String,
  })
  readonly password: string
}
