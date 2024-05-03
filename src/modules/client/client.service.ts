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

  findClientByIdWithRelations(id: number): Promise<Nullable<Client>> {
    return this.clientRepository.findOne({
      where: { id },
      relations: ['users'],
    })
  }

  findClientByPhone(phone: string): Promise<Client> {
    return this.clientRepository.findOneBy({ phone })
  }

  async createClient(user: User): Promise<Partial<Client>> {
    const newClient: Client = await this.clientRepository.create({
      users: [user],
    })

    const { id }: Partial<Client> = await this.clientRepository.save(newClient)
    return { id }
  }

  async updateClient({
    id,
    tokenUserId,
    birthDate,
    gender,
    firstName,
    lastName,
  }: {
    id: number
    tokenUserId?: number
    birthDate?: string
    gender?: EGender
    firstName?: string
    lastName?: string
  }): Promise<Client> {
    const foundClient: Nullable<Client> =
      await this.findClientByIdWithRelations(id)

    if (!foundClient) {
      throw new HttpException(CError.CLIENT_NOT_FOUND, HttpStatus.BAD_REQUEST)
    }

    const userId = foundClient.users[0].id

    if (!userId) {
      throw new HttpException(CError.USER_NOT_FOUND, HttpStatus.BAD_REQUEST)
    }

    if (tokenUserId && tokenUserId !== userId) {
      throw new HttpException(
        CError.WRONG_USER_ID_OR_CLIENT_ID,
        HttpStatus.BAD_REQUEST,
      )
    }

    const foundUser: Nullable<User> =
      await this.userService.findUserById(userId)

    if (!foundUser) {
      throw new HttpException(CError.USER_NOT_FOUND, HttpStatus.BAD_REQUEST)
    }

    const updatedUser: User = await this.userService.updateUser({
      id: userId,
      firstName,
      lastName,
    })
    const newClient: Client = await this.clientRepository.create({
      id,
      ...(birthDate ? { birthDate } : {}),
      ...(gender ? { gender } : {}),
      users: [updatedUser],
    })

    return this.clientRepository.save(newClient)
  }
}
