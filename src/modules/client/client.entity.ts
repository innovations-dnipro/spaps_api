import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  Relation,
} from 'typeorm'

import { ApiProperty } from '@nestjs/swagger'

import { PublicFile } from '@spaps/modules/file-upload/public-file.entity'

import { BasicEntity } from '@spaps/core/basic-entity'
import type { User } from '@spaps/core/core-module/user/user.entity'
import { EGender } from '@spaps/core/enums'
import { formatDateToDateTime } from '@spaps/core/utils'

@Entity({ name: 'client' })
export class Client extends BasicEntity {
  @ApiProperty({
    example: '2024-01-15',
    description: 'Date of birth',
  })
  @Column({
    type: 'date',
    transformer: {
      from: (value: Date) => formatDateToDateTime({ value }),
      to: (value: string | undefined) =>
        typeof value === 'string' ? new Date(value) : value,
    },
    default: null,
    nullable: true,
  })
  birthDate: Date

  @ApiProperty({
    example: EGender.FEMALE,
    description: "Client's gender.",
  })
  @Column({ type: 'enum', enum: EGender, default: null, nullable: true })
  gender: EGender

  @ManyToMany('User', 'clients')
  @JoinTable()
  users: Relation<User>[]

  @OneToOne(() => PublicFile, (publicFile) => publicFile.avatarClient)
  @JoinColumn()
  avatar: PublicFile
}
