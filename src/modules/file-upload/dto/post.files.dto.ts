import { Exclude } from 'class-transformer'
import { IsOptional } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'

import { BufferedFile } from '../file.model'

export class PostFileDto {
  @Exclude()
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Select files for feed.',
    required: false,
  })
  @IsOptional()
  readonly files: BufferedFile[]
}
