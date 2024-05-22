import { Repository } from 'typeorm'

import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { FileUploadService } from '@spaps/modules/file-upload/file-upload.service'
import { BufferedFile } from '@spaps/modules/file-upload/file.model'
import { PublicFile } from '@spaps/modules/file-upload/public-file.entity'

import { User } from '@spaps/core/core-module/user/user.entity'
import { UserService } from '@spaps/core/core-module/user/user.service'
import { EGender } from '@spaps/core/enums'
import { CError, Nullable } from '@spaps/core/utils'

import { Client } from './client.entity'

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    private readonly userService: UserService,
    @InjectRepository(PublicFile)
    private publicFileRepository: Repository<PublicFile>,
    private readonly fileUploadService: FileUploadService,
  ) {}

  findClientById(id: number): Promise<Nullable<Client>> {
    return this.clientRepository.findOneBy({ id })
  }

  findClientByIdWithRelations(id: number): Promise<Nullable<Client>> {
    return this.clientRepository.findOne({
      where: { id },
      relations: ['users', 'avatar'],
    })
  }

  async getClientById({
    id,
    tokenUserId,
  }: {
    id: number
    tokenUserId?: number
  }): Promise<Nullable<Client>> {
    const foundClient = await this.findClientByIdWithRelations(id)
    const userId = foundClient?.users?.[0]?.id

    if (!foundClient) {
      throw new HttpException(CError.CLIENT_NOT_FOUND, HttpStatus.BAD_REQUEST)
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

    return foundClient
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
    const userId = foundClient?.users?.[0]?.id

    if (!foundClient) {
      throw new HttpException(CError.CLIENT_NOT_FOUND, HttpStatus.BAD_REQUEST)
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
    const newClient: Client = await this.clientRepository.create({
      id,
      ...(birthDate ? { birthDate } : {}),
      ...(gender ? { gender } : {}),
      users: [updatedUser],
    })

    return this.clientRepository.save(newClient)
  }

  async findClientAvatar(id: number): Promise<PublicFile> {
    const foundClient = await this.findClientByIdWithRelations(id)

    if (!foundClient) {
      throw new HttpException(CError.CLIENT_NOT_FOUND, HttpStatus.BAD_REQUEST)
    }

    return this.publicFileRepository.findOneBy({ id: foundClient?.avatar?.id })
  }

  async addClientAvatar(id: number, avatar: BufferedFile): Promise<number> {
    if (!avatar) {
      throw new HttpException(CError.NO_FILE_PROVIDED, HttpStatus.BAD_REQUEST)
    }

    const foundClient = await this.findClientByIdWithRelations(id)

    if (!foundClient) {
      throw new HttpException(CError.CLIENT_NOT_FOUND, HttpStatus.BAD_REQUEST)
    }

    if (foundClient?.avatar) {
      //NOTE: remove the previous avatar
      const noAvatarClient = await this.clientRepository.create({
        ...foundClient,
        avatar: null,
      })
      await this.clientRepository.save(noAvatarClient)
      await this.fileUploadService.deletePublicFile(foundClient?.avatar?.id)
    }

    const avatarData: PublicFile =
      await this.fileUploadService.uploadPublicFile(avatar)

    const createdPublicFile = await this.publicFileRepository.create({
      ...avatarData,
      avatarClient: foundClient,
    })
    await this.publicFileRepository.save(createdPublicFile)

    return 200
  }

  async removeClientFile(clientId: number) {
    const foundClient: Nullable<Client> =
      await this.findClientByIdWithRelations(clientId)

    if (!foundClient) {
      throw new HttpException(CError.FILE_NOT_FOUND, HttpStatus.BAD_REQUEST)
    }

    const newClient: Client = await this.clientRepository.create({
      ...foundClient,
      avatar: null,
    })
    await this.clientRepository.save(newClient)

    return await this.fileUploadService.deletePublicFile(
      foundClient?.avatar?.id,
    )
  }
}
