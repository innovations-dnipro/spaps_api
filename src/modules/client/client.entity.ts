import { Column, Entity, Index, JoinTable, ManyToMany } from 'typeorm'

import { ApiProperty } from '@nestjs/swagger'

import { BasicEntity } from '@spaps/core/basic-entity'
import { EGender } from '@spaps/core/enums'
import { formatDateToDateTime } from '@spaps/core/utils'

import { User } from '../core-module/user/user.entity'

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
      to: (value: string) => new Date(value),
    },
  })
  birthDate: Date

  @ApiProperty({
    example: EGender.FEMALE,
    description: "Client's gender.",
  })
  @Column({ type: 'enum', enum: EGender, default: EGender.FEMALE })
  gender: EGender

  @ApiProperty({
    example: '380681234567',
    description: `User's telephone number. Max length is ${process.env.MAX_PHONE_LENGTH} characters.`,
  })
  @Index()
  @Column({
    type: 'varchar',
    length: process.env.MAX_PHONE_LENGTH,
    default: null,
    nullable: true,
  })
  phone: string

  @ManyToMany(() => User, (user) => user.clients)
  @JoinTable()
  users: User[]
}
