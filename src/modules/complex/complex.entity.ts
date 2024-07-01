import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm'

import { ApiProperty } from '@nestjs/swagger'

import { PublicFile } from '@spaps/modules/file-upload/public-file.entity'
import { Rentor } from '@spaps/modules/rentor/rentor.entity'

import { BasicEntity } from '@spaps/core/basic-entity'

@Entity({ name: 'complex' })
export class Complex extends BasicEntity {
  @ApiProperty({
    example: 'Complex Name',
    description: `The name of the complex. Max length is 35 characters.`,
  })
  @Index()
  @Column({
    type: 'varchar',
    length: 35,
    default: null,
    nullable: true,
  })
  name: string

  @ApiProperty({
    example: 'Complex Region',
    description: `The region of the complex. Max length is 35 characters.`,
  })
  @Index()
  @Column({
    type: 'varchar',
    length: 35,
    default: null,
    nullable: true,
  })
  region: string

  @ApiProperty({
    example: 'Complex Location',
    description: `The location of the complex. Max length is 35 characters.`,
  })
  @Index()
  @Column({
    type: 'varchar',
    length: 35,
    default: null,
    nullable: true,
  })
  location: string

  @ApiProperty({
    example:
      'Some post-code, some region, some town, some street, some block, some suite.',
    description: 'The address of the complex. Max length is 254 characters.',
  })
  @Column({
    type: 'varchar',
    length: 254,
    default: null,
    nullable: true,
  })
  address: string

  @ApiProperty({
    example: 'Some complex description.',
    description:
      'The description of the complex. Max length is 3000 characters.',
  })
  @Column({
    type: 'mediumtext',
    default: null,
    nullable: true,
  })
  description: string

  @ApiProperty({ example: 3, description: 'Photo Id' })
  @Column({ type: 'decimal', precision: 12, scale: 0, default: 0 })
  mainPhotoId: number

  @ManyToOne(() => Rentor, (rentor) => rentor.complexes)
  @Index()
  rentor: Rentor

  @OneToMany(() => PublicFile, (publicFile) => publicFile.complex)
  photos: PublicFile[]
}
