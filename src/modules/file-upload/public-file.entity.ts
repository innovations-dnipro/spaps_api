import { Column, Entity, ManyToOne, OneToOne } from 'typeorm'

import { ApiProperty } from '@nestjs/swagger'

import { Client } from '@spaps/modules/client/client.entity'

import { BasicEntity } from '@spaps/core/basic-entity'

import { Complex } from '../complex/complex.entity'

@Entity({ name: 'public_file' })
export class PublicFile extends BasicEntity {
  @Column()
  @ApiProperty({
    example: 'file url',
  })
  url: string

  @Column()
  @ApiProperty({
    example: 'file key',
  })
  key: string

  @Column()
  @ApiProperty({
    example: 'file type',
  })
  type: string

  @Column()
  @ApiProperty({
    example: 'file name',
  })
  name: string

  @OneToOne(() => Client, (clients) => clients.avatar)
  avatarClient: Client

  @ManyToOne(() => Complex, (complex) => complex.photos)
  complex: Complex
}
