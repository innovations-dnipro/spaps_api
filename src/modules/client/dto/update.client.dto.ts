import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'

import { EGender } from '@spaps/core/enums'
import {
  LATIN_CYRILLIC_LETTER_NAME_REGEX,
  YYYY_MM_DD_REGEX,
} from '@spaps/core/utils'

export class UpdateClientDto {
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
    description: 'Enter last name.',
    type: String,
  })
  readonly lastName: string

  @IsOptional()
  @IsString()
  @IsEnum(EGender)
  @ApiProperty({
    example: EGender.FEMALE,
    description: 'Enter the gender.',
    type: String,
  })
  readonly gender: EGender

  @IsDateString()
  @IsNotEmpty()
  @Matches(YYYY_MM_DD_REGEX)
  @ApiProperty({
    example: '1990-01-25',
    description: 'Enter the date of birth.',
    type: String,
  })
  readonly birthDate: string
}
