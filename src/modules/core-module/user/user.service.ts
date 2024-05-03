import { genSalt, hash } from 'bcrypt'
import { Repository } from 'typeorm'

import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { ENonAdminRole } from '@spaps/core/enums'
import { CError, Nullable, findWrongEnumValue } from '@spaps/core/utils'

import { User } from './user.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findUserById(id: number): Promise<Nullable<User>> {
    return this.userRepository.findOneBy({ id })
  }

  findUserByEmail(email: string): Promise<Nullable<User>> {
    return this.userRepository.findOneBy({ email })
  }

  findUserByEmailWithRelations(email: string): Promise<Nullable<User>> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['clients', 'rentors'],
    })
  }

  async createUser(userData: Partial<User>) {
    const { firstName, lastName, email, role, password } = userData

    const [foundUserByEmail, wrongRole]: [Nullable<User>, Nullable<string>] =
      await Promise.all([
        this.findUserByEmail(email),
        findWrongEnumValue({
          $enum: ENonAdminRole,
          value: role,
        }),
      ])

    if (foundUserByEmail) {
      throw new HttpException(
        CError.EMAIL_ALREADY_EXISTS,
        HttpStatus.BAD_REQUEST,
      )
    }

    if (wrongRole) {
      throw new HttpException(CError.WRONG_ENUM, HttpStatus.BAD_REQUEST)
    }

    const saltRounds = parseInt(process.env.PASSWORD_SALT_ROUNDS)
    const salt = await genSalt(saltRounds)
    const hashedPassword: string = await hash(password, salt)
    const newUser: User = this.userRepository.create({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role,
    })

    return this.userRepository.save(newUser)
  }

  async updateUser(userData: Partial<User>) {
    const { id, password, firstName, lastName, email } = userData
    let hashedPassword: string
    const foundUser: Nullable<User> = await this.findUserById(id)

    if (!foundUser) {
      throw new HttpException(CError.USER_NOT_FOUND, HttpStatus.BAD_REQUEST)
    }

    if (password) {
      const saltRounds = parseInt(process.env.PASSWORD_SALT_ROUNDS)
      const salt = await genSalt(saltRounds)
      hashedPassword = await hash(password, salt)
    }

    const updatedUser: User = this.userRepository.create({
      ...foundUser,
      ...(password ? { password: hashedPassword } : {}),
      ...(email ? { email } : {}),
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
    })

    return this.userRepository.save(updatedUser)
  }
}
