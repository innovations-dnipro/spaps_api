import { Repository } from 'typeorm'

import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { User } from '@spaps/modules/core-module/user/user.entity'
import { UserService } from '@spaps/modules/core-module/user/user.service'

import { EGender } from '@spaps/core/enums'
import { CError, Nullable } from '@spaps/core/utils'

import { Client } from './client.entity'

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    private readonly userService: UserService,
  ) {}

  findClientByPhone(phone: string): Promise<Client> {
    return this.clientRepository.findOneBy({ phone })
  }

  async createClient({
    userId,
    birthDate,
    gender,
    phone,
  }: {
    userId: number
    birthDate: string
    gender: EGender
    phone?: string
  }): Promise<Client> {
    const [foundClientByPhone, foundUserById]: [
      Nullable<Client>,
      Nullable<User>,
    ] = await Promise.all([
      this.findClientByPhone(phone),
      this.userService.findUserById(userId),
    ])

    if (foundClientByPhone) {
      throw new HttpException(
        CError.PHONE_ALREADY_EXISTS,
        HttpStatus.BAD_REQUEST,
      )
    }

    //check if a phone unique
    const newClient: Client = this.clientRepository.create({
      birthDate,
      gender,
      phone,
      users: [foundUserById],
      // files: fileListData || [],
    })

    return this.clientRepository.save(newClient)
  }
}
