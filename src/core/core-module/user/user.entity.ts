import { Exclude } from 'class-transformer'
import * as dotenv from 'dotenv'
import { Column, Entity, Index, ManyToMany } from 'typeorm'

import { ApiProperty } from '@nestjs/swagger'

import { Client } from '../../../modules/client/client.entity'
import { Rentor } from '../../../modules/rentor/rentor.entity'
import { BasicEntity } from '../../basic-entity'
import { ERole } from '../../enums'

dotenv.config()

@Entity({ name: 'users' })
export class User extends BasicEntity {
  @ApiProperty({
    example: 'John',
    description: `User's first name. Min length is ${process.env.MIN_FIRST_NAME_LENGTH} characters. Max length is ${process.env.MAX_FIRST_NAME_LENGTH} characters.`,
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
    description: `User's last name. Min length is ${process.env.MIN_LAST_NAME_LENGTH} characters. Max length is ${process.env.MAX_LAST_NAME_LENGTH} characters.`,
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

  // @ManyToMany(() => PublicFile, (publicFile) => publicFile.userAvatars)
  // @JoinTable()
  // avatars: PublicFile[]

  @ManyToMany(() => Client, (client) => client.users)
  clients: Client[]

  @ManyToMany(() => Rentor, (rentor) => rentor.users)
  rentors: Rentor[]
}
