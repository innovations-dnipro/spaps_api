import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate'
import { Repository } from 'typeorm'

import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { FileUploadService } from '@spaps/modules/file-upload/file-upload.service'
import { BufferedFile } from '@spaps/modules/file-upload/file.model'
import { PublicFile } from '@spaps/modules/file-upload/public-file.entity'
import { RentorService } from '@spaps/modules/rentor/rentor.service'

import { EFileCategory } from '@spaps/core/enums'
// import { UserService } from '@spaps/core/core-module/user/user.service'
import { CError, Nullable } from '@spaps/core/utils'

import { Complex } from './complex.entity'
import { complexPaginationConfig } from './pagination/complex.pagination.config'

@Injectable()
export class ComplexService {
  constructor(
    @InjectRepository(Complex)
    private complexRepository: Repository<Complex>,
    private readonly rentorService: RentorService,
    @InjectRepository(PublicFile)
    private publicFileRepository: Repository<PublicFile>,
    private readonly fileUploadService: FileUploadService,
  ) {}

  findComplexById(id: number): Promise<Nullable<Complex>> {
    return this.complexRepository.findOneBy({ id })
  }

  findComplexByIdWithRelations(id: number): Promise<Nullable<Complex>> {
    return this.complexRepository.findOne({
      where: { id },
      relations: ['photos', 'rentor'],
    })
  }

  async findAll(query: PaginateQuery): Promise<Paginated<Complex>> {
    return paginate(query, this.complexRepository, complexPaginationConfig)
  }

  async createComplex({
    name,
    location,
    region,
    address,
    description,
    rentorId,
    files,
  }: {
    name: string
    location: string
    region: string
    address: string
    description: string
    rentorId: number
    files: BufferedFile[]
  }): Promise<Partial<Complex>> {
    const foundRentor = await this.rentorService.findRentorById(rentorId)
    let complexPhotoListData: PublicFile[]

    if (!foundRentor) {
      throw new HttpException(CError.RENTOR_NOT_FOUND, HttpStatus.BAD_REQUEST)
    }

    if (files) {
      const complexPhotoFiles = files.filter(({ fieldname }) => {
        return fieldname === EFileCategory.COMPLEX_PHOTOS
      })
      const data =
        await this.fileUploadService.uploadPublicFiles(complexPhotoFiles)
      complexPhotoListData = data
    }

    const newComplex: Complex = await this.complexRepository.create({
      ...(name ? { name } : {}),
      ...(region ? { region } : {}),
      ...(location ? { location } : {}),
      ...(address ? { address } : {}),
      ...(description ? { description } : {}),
      rentor: { id: rentorId },
      photos:
        Array.isArray(complexPhotoListData) && complexPhotoListData.length
          ? complexPhotoListData
          : [],
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
      ...(name ? { name } : {}),
      ...(address ? { address } : {}),
      ...(description ? { description } : {}),
      ...(rentorId ? { rentor: { id: rentorId } } : {}),
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

    if (Array.isArray(foundComplex.photos) && foundComplex.photos.length) {
      await Promise.all(
        foundComplex.photos.map((photo) => {
          return this.fileUploadService.deletePublicFile(photo.id)
        }),
      )
    }

    return this.complexRepository.remove(foundComplex)
  }

  async findComplexPhoto(photoId: number): Promise<PublicFile> {
    return this.publicFileRepository.findOneBy({ id: photoId })
  }

  async addComplexPhotos(
    complexId: number,
    photos: BufferedFile[],
  ): Promise<number> {
    if (!Array.isArray(photos) || !photos.length) {
      throw new HttpException(CError.NO_FILE_PROVIDED, HttpStatus.BAD_REQUEST)
    }

    const foundComplex = await this.findComplexByIdWithRelations(complexId)

    if (!foundComplex) {
      throw new HttpException(CError.COMPLEX_NOT_FOUND, HttpStatus.BAD_REQUEST)
    }

    const photoListData: PublicFile[] =
      await this.fileUploadService.uploadPublicFiles(photos)

    const createdPublicFiles = await Promise.all(
      (photoListData || []).map((photoData) => {
        return this.publicFileRepository.create({
          ...photoData,
          complex: foundComplex,
        })
      }),
    )

    await Promise.all(
      createdPublicFiles.map((file) => {
        return this.publicFileRepository.save(file)
      }),
    )

    return 200
  }

  async removeComplexPhoto(complexId: number, fileId: number) {
    const foundClient: Nullable<Complex> =
      await this.findComplexByIdWithRelations(complexId)

    if (!foundClient) {
      throw new HttpException(CError.COMPLEX_NOT_FOUND, HttpStatus.BAD_REQUEST)
    }
    return await this.fileUploadService.deletePublicFile(fileId)
  }
}
