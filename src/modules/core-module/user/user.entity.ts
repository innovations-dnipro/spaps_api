import { Exclude } from 'class-transformer'
import * as dotenv from 'dotenv'
import { Column, Entity, Index } from 'typeorm'

import { ApiProperty } from '@nestjs/swagger'

import { BasicEntity } from '@spaps/core/basic-entity'
import { ERole } from '@spaps/core/enums'

dotenv.config()

@Entity({ name: 'users' })
export class User extends BasicEntity {
  @ApiProperty({
    example: 'John',
    description: `User's first name. Max length is ${process.env.MAX_FIRST_NAME_LENGTH} characters.`,
  })
  @Column({
    type: 'varchar',
    length: process.env.MAX_FIRST_NAME_LENGTH,
    default: null,
    nullable: true,
  })
  firstName: string

  @ApiProperty({
    example: 'Johnson',
    description: `User's last name. Max length is ${process.env.MAX_LAST_NAME_LENGTH} characters.`,
  })
  @Index()
  @Column({
    type: 'varchar',
    length: process.env.MAX_LAST_NAME_LENGTH,
    default: null,
    nullable: true,
  })
  lastName: string

  @ApiProperty({
    example: 'test@email.com',
    description: `User's email. Max length is ${process.env.MAX_EMAIL_LENGTH} characters.`,
  })
  @Column({
    type: 'varchar',
    length: process.env.MAX_EMAIL_LENGTH,
    default: null,
    nullable: true,
  })
  email: string

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

  @ApiProperty({
    example: '123Abc!',
    description: "User's password",
  })
  @Exclude({ toPlainOnly: true })
  @Column({ type: 'varchar', default: null, nullable: true })
  password: string

  @ApiProperty({
    example: 1,
    description:
      "User's role. SUPERADMIN, ADMIN, RENTOR, CLIENT. Admin role  will be added automatically",
  })
  @Column({ type: 'enum', enum: ERole, default: ERole.ADMIN })
  role: ERole
}
