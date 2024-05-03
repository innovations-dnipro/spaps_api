import { Repository } from 'typeorm'

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { User } from '@spaps/modules/core-module/user/user.entity'

import { Rentor } from './rentor.entity'

@Injectable()
export class RentorService {
  constructor(
    @InjectRepository(Rentor)
    private rentorRepository: Repository<Rentor>,
  ) {}

  async createRentor(user: User): Promise<Partial<Rentor>> {
    const newClient: Rentor = await this.rentorRepository.create({
      users: [user],
    })

    const { id }: Partial<Rentor> = await this.rentorRepository.save(newClient)

    return { id }
  }
}
