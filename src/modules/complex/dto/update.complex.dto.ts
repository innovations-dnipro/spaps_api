import { Exclude } from 'class-transformer'
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'

import { BufferedFile } from '@spaps/modules/file-upload/file.model'

import { EFileCategory } from '@spaps/core/enums'

export class UpdateComplexDto {
  @IsString()
  @IsOptional()
  @MaxLength(35)
  @MinLength(1)
  @ApiProperty({
    example: 'Complex Name',
    description: 'Enter complex name.',
    type: String,
    required: false,
  })
  readonly name: string

  @IsString()
  @IsOptional()
  @MaxLength(35)
  @MinLength(1)
  // @IsNotEmpty()
  @ApiProperty({
    example: 'Complex Region',
    description: 'Enter complex region.',
    type: String,
    required: false,
  })
  readonly region: string

  @IsString()
  @IsOptional()
  @MaxLength(35)
  @MinLength(1)
  @ApiProperty({
    example: 'Complex Location',
    description: 'Enter complex location.',
    type: String,
    required: false,
  })
  readonly location: string

  @IsString()
  @IsOptional()
  @MaxLength(254)
  @MinLength(1)
  @ApiProperty({
    example: 'Some address',
    description: 'Enter address.',
    type: String,
    required: false,
  })
  readonly address: string

  @IsString()
  @IsOptional()
  @MaxLength(3000)
  @MinLength(1)
  @ApiProperty({
    example: 'Some complex description',
    description: 'Enter description.',
    type: String,
    required: false,
  })
  readonly description: string;

  @Exclude()
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Select photos for complex.',
    required: false,
  })
  @IsOptional()
  readonly [EFileCategory.COMPLEX_PHOTOS]: BufferedFile[]
}
