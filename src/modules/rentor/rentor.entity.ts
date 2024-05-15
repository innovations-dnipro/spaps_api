import { Entity, JoinTable, ManyToMany } from 'typeorm'

import { BasicEntity } from '@spaps/core/basic-entity'
import { User } from '@spaps/core/core-module/user/user.entity'

@Entity({ name: 'rentor' })
export class Rentor extends BasicEntity {
  @ManyToMany(() => User, (user) => user.rentors)
  @JoinTable()
  users: User[]
}
