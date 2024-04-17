import { genSalt, hash } from 'bcrypt'
import { Cache } from 'cache-manager'
import { Repository } from 'typeorm'

import { CACHE_MANAGER } from '@nestjs/cache-manager'
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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  findUserById(id: number): Promise<Nullable<User>> {
    return this.userRepository.findOneBy({ id })
  }

  findUserByEmail(email: string): Promise<Nullable<User>> {
    return this.userRepository.findOneBy({ email })
  }

  findUserByPhone(phone: string): Promise<Nullable<User>> {
    return this.userRepository.findOneBy({ phone })
  }

  async setPassword(
    { password }: { password: string },
    registeredUser: Partial<User>,
  ) {
    const { firstName, lastName, email, role } = registeredUser

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
}
