import { Repository } from 'typeorm'

import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { User } from '@spaps/core/core-module/user/user.entity'
import { UserService } from '@spaps/core/core-module/user/user.service'
import { CError, Nullable } from '@spaps/core/utils'

import { Rentor } from './rentor.entity'

@Injectable()
export class RentorService {
  constructor(
    @InjectRepository(Rentor)
    private rentorRepository: Repository<Rentor>,
    private readonly userService: UserService,
  ) {}

  findRentorById(id: number): Promise<Nullable<Rentor>> {
    return this.rentorRepository.findOneBy({ id })
  }

  findRentorByIdWithRelations(id: number): Promise<Nullable<Rentor>> {
    return this.rentorRepository.findOne({
      where: { id },
      relations: ['users'],
    })
  }

  async createRentor(user: User): Promise<Partial<Rentor>> {
    const newRentor: Rentor = await this.rentorRepository.create({
      users: [user],
    })

    const { id }: Partial<Rentor> = await this.rentorRepository.save(newRentor)

    return { id }
  }

  async updateRentor({
    id,
    tokenUserId,
    firstName,
    lastName,
  }: {
    id: number
    tokenUserId?: number
    firstName?: string
    lastName?: string
  }): Promise<Rentor> {
    const foundRentor: Nullable<Rentor> =
      await this.findRentorByIdWithRelations(id)
    const userId = foundRentor?.users?.[0]?.id

    if (!foundRentor) {
      throw new HttpException(CError.RENTOR_NOT_FOUND, HttpStatus.BAD_REQUEST)
    }

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
    const newRentor: Rentor = await this.rentorRepository.create({
      id,
      users: [updatedUser],
    })

    return this.rentorRepository.save(newRentor)
  }
}
