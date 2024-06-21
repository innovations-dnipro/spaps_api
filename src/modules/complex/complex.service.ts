import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate'
import { Repository } from 'typeorm'

import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

// import { UserService } from '@spaps/core/core-module/user/user.service'
import { CError, Nullable } from '@spaps/core/utils'

// import { FileUploadService } from '@spaps/modules/file-upload/file-upload.service'
import { PublicFile } from '@spaps/modules/file-upload/public-file.entity'
import { RentorService } from './../rentor/rentor.service'
import { Complex } from './complex.entity'
import { complexPaginationConfig } from './pagination/complex.pagination.config'

@Injectable()
export class ComplexService {
  constructor(
    @InjectRepository(Complex)
    private complexRepository: Repository<Complex>,
    private readonly rentorService: RentorService,
    // @InjectRepository(PublicFile)
    // private publicFileRepository: Repository<PublicFile>,
    // private readonly fileUploadService: FileUploadService,
  ) {}

  findComplexById(id: number): Promise<Nullable<Complex>> {
    return this.complexRepository.findOneBy({ id })
  }

  findComplexByIdWithRelations(id: number): Promise<Nullable<Complex>> {
    return this.complexRepository.findOne({
      where: { id },
      relations: ['complexPhoto', 'rentor'],
    })
  }

  async findAll(query: PaginateQuery): Promise<Paginated<Complex>> {
    return paginate(query, this.complexRepository, complexPaginationConfig)
  }

  async createComplex({
    name,
    address,
    description,
    rentorId,
  }: {
    name: string
    address: string
    description: string
    rentorId: number
  }): Promise<Partial<Complex>> {
    const foundRentor = await this.rentorService.findRentorById(rentorId)

    if (!foundRentor) {
      throw new HttpException(CError.RENTOR_NOT_FOUND, HttpStatus.BAD_REQUEST)
    }

    const newComplex: Complex = await this.complexRepository.create({
      name,
      address,
      description,
      rentor: { id: rentorId },
    })

    const savedComplex: Partial<Complex> =
      await this.complexRepository.save(newComplex)
    return savedComplex
  }

  async updateComplex({
    id,
    name,
    address,
    description,
    rentorId,
  }: {
    id: number
    name: string
    address: string
    description: string
    rentorId: number
  }): Promise<Partial<Complex>> {
    const [foundComplex, foundRentor] = await Promise.all([
      this.findComplexById(id),
      this.rentorService.findRentorById(rentorId),
    ])

    if (!foundComplex || !foundRentor) {
      throw new HttpException(CError.RENTOR_NOT_FOUND, HttpStatus.BAD_REQUEST)
    }

    const newComplex: Complex = await this.complexRepository.create({
      id,
      name,
      address,
      description,
      rentor: { id: rentorId },
    })

    const savedComplex: Partial<Complex> =
      await this.complexRepository.save(newComplex)
    return savedComplex
  }

  async removeComplex({
    complexId,
    rentorId,
  }: {
    complexId: number
    rentorId: number
  }) {
    const [foundComplex, foundRentor] = await Promise.all([
      this.findComplexByIdWithRelations(complexId),
      this.rentorService.findRentorById(rentorId),
    ])

    if (!foundComplex) {
      throw new HttpException(CError.COMPLEX_NOT_FOUND, HttpStatus.BAD_REQUEST)
    }

    if (foundComplex.rentor.id !== foundRentor.id) {
      throw new HttpException(
        CError.COMPLEX_ID_NOT_RELATED,
        HttpStatus.BAD_REQUEST,
      )
    }

    return this.complexRepository.remove(foundComplex)
  }
}
