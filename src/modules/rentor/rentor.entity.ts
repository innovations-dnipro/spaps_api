import { Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm'

import { Complex } from '@spaps/modules/complex/complex.entity'

import { BasicEntity } from '@spaps/core/basic-entity'
import { User } from '@spaps/core/core-module/user/user.entity'

@Entity({ name: 'rentor' })
export class Rentor extends BasicEntity {
  @ManyToMany(() => User, (user) => user.rentors)
  @JoinTable()
  users: User[]

  @OneToMany(() => Complex, (complex) => complex.rentor)
  complexes: Complex[]
}
