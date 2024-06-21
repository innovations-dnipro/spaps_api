import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'

export class UpdateComplexDto {
  @IsString()
  @MaxLength(35)
  @MinLength(1)
  @IsNotEmpty()
  @ApiProperty({
    example: 'Complex Name',
    description: 'Enter complex name.',
    type: String,
  })
  readonly name: string

  @IsString()
  @MaxLength(254)
  @MinLength(1)
  @IsNotEmpty()
  @ApiProperty({
    example: 'Some address',
    description: 'Enter address.',
    type: String,
  })
  readonly address: string

  @IsString()
  @MaxLength(3000)
  @MinLength(1)
  @IsNotEmpty()
  @ApiProperty({
    example: 'Some complex description',
    description: 'Enter description.',
    type: String,
  })
  readonly description: string
}
