import { Exclude } from 'class-transformer'

import { ApiProperty } from '@nestjs/swagger'

import { BufferedFile } from '@spaps/modules/file-upload/file.model'

export class AddClientAvatarDto {
  @Exclude()
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Select avatar for the client.',
    required: true,
  })
  readonly clientAvatar: BufferedFile
}
