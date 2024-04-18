import { IsNotEmpty, IsString } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'

export class SetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '123Abc!_z',
    description: 'Enter password.',
    type: String,
  })
  readonly password: string
}
