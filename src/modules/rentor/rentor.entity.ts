import { Entity, JoinTable, ManyToMany } from 'typeorm'

import { User } from '@spaps/modules/core-module/user/user.entity'

import { BasicEntity } from '@spaps/core/basic-entity'

@Entity({ name: 'rentor' })
export class Rentor extends BasicEntity {
  @ManyToMany(() => User, (user) => user.rentors)
  @JoinTable()
  users: User[]
}
