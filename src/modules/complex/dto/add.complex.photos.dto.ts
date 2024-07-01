import { Exclude } from 'class-transformer'

import { ApiProperty } from '@nestjs/swagger'

import { BufferedFile } from '@spaps/modules/file-upload/file.model'

export class AddComplexPhotosDto {
  @Exclude()
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Select photos for the complex.',
    required: true,
  })
  readonly complexPhotos: BufferedFile[]
}
