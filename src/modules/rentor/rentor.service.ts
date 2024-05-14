import { Repository } from 'typeorm'

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { User } from '@spaps/core/core-module/user/user.entity'
import { Nullable } from '@spaps/core/utils'

import { Rentor } from './rentor.entity'

@Injectable()
export class RentorService {
  constructor(
    @InjectRepository(Rentor)
    private rentorRepository: Repository<Rentor>,
  ) {}

  findRentorById(id: number): Promise<Nullable<Rentor>> {
    return this.rentorRepository.findOneBy({ id })
  }

  async createRentor(user: User): Promise<Partial<Rentor>> {
    const newClient: Rentor = await this.rentorRepository.create({
      users: [user],
    })

    const { id }: Partial<Rentor> = await this.rentorRepository.save(newClient)

    return { id }
  }
}
