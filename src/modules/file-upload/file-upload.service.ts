import { S3 } from 'aws-sdk'
import { randomUUID } from 'crypto'
import * as stream from 'stream'
import { Repository } from 'typeorm'

import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'

import { CError } from '@spaps/core/utils'

import { BufferedFile } from './file.model'
import { PublicFile } from './public-file.entity'

@Injectable()
export class FileUploadService {
  private s3: S3
  constructor(
    @InjectRepository(PublicFile)
    private publicFilesRepository: Repository<PublicFile>,
    private readonly configService: ConfigService,
  ) {
    this.s3 = new S3({
      accessKeyId: this.configService.get('MINIO_ACCESS_KEY'),
      secretAccessKey: this.configService.get('MINIO_SECRET_KEY'),
      region: this.configService.get('MINIO_REGION'),
      endpoint: `${this.configService.get(
        'MINIO_ENDPOINT',
      )}:${this.configService.get('MINIO_PORT')}`,
      s3ForcePathStyle: this.configService.get('MINIO_S3_FORCE_PATH_STYLE'),
      signatureVersion: this.configService.get('MINIO_SIGNATURE_VERSION'),
    })
  }

  private async removeS3file(fileInfo) {
    return await Promise.all([
      this.s3
        .deleteObject({
          Bucket: this.configService.get('MINIO_BUCKET'),
          Key: fileInfo.key,
        })
        .promise(),
      this.publicFilesRepository.remove(fileInfo),
    ])
  }

  async uploadPublicFile(file: BufferedFile): Promise<PublicFile> {
    const { buffer, fieldname, originalname, mimetype } = file
    const uploadResult = await this.s3
      .upload({
        Bucket: this.configService.get('MINIO_BUCKET'),
        Body: buffer,
        Key: `${fieldname}/${randomUUID()}-${originalname}`,
      })
      .promise()

    const newFile = this.publicFilesRepository.create({
      key: uploadResult.Key,
      url: uploadResult.Location,
      type: mimetype,
      name: originalname,
    })

    await this.publicFilesRepository.save(newFile)

    return newFile
  }

  async uploadPublicFiles(files: BufferedFile[]): Promise<PublicFile[]> {
    const uploadResultList = await Promise.all(
      files.map(({ buffer, fieldname, originalname }) => {
        return this.s3
          .upload({
            Bucket: this.configService.get('MINIO_BUCKET'),
            Body: buffer,
            Key: `${fieldname}/${randomUUID()}-${originalname}`,
          })
          .promise()
      }),
    )

    const newFileList = await Promise.all(
      uploadResultList.map(async (uploadResult, index) => {
        const newFile = this.publicFilesRepository.create({
          key: uploadResult.Key,
          url: uploadResult.Location,
          type: files[index].mimetype,
          name: files[index].originalname,
        })

        await this.publicFilesRepository.save(newFile)

        return newFile
      }),
    )

    return newFileList
  }

  async deletePublicFile(fileId: number): Promise<boolean | unknown> {
    const fileInfo = await this.publicFilesRepository.findOneBy({ id: fileId })

    if (!fileInfo) {
      return true
    }

    try {
      await this.removeS3file(fileInfo)

      return true
    } catch (error) {
      return error
    }
  }

  async deletePublicFiles(fileIds: number[]): Promise<boolean | unknown> {
    let fileListInfo = await Promise.all(
      fileIds.map((id) => this.publicFilesRepository.findOneBy({ id })),
    )
    fileListInfo = fileListInfo.filter(
      (info) => info !== null && info !== undefined,
    )

    if (!fileListInfo.length) {
      return true
    }

    try {
      await Promise.all(
        fileListInfo.map((fileInfo) => this.removeS3file(fileInfo)),
      )
      return true
    } catch (error) {
      return error
    }
  }

  async getFile(
    id: number,
    category: string,
  ): Promise<{ fileInfo: PublicFile; stream: stream.Readable }> {
    const fileInfo: PublicFile = await this.publicFilesRepository.findOneBy({
      id,
    })
    const fileCategoryPattern = new RegExp('^' + category)

    if (!fileCategoryPattern.test(fileInfo.key)) {
      throw new HttpException(
        `${CError.FILE_ID_NOT_RELATED_TO_SECTION} ${category}`,
        HttpStatus.BAD_REQUEST,
      )
    }

    if (fileInfo) {
      const stream = this.s3
        .getObject({
          Bucket: this.configService.get('MINIO_BUCKET'),
          Key: fileInfo.key,
        })
        .createReadStream()

      return {
        fileInfo,
        stream,
      }
    }

    throw new HttpException(CError.FILE_NOT_FOUND, HttpStatus.BAD_REQUEST)
  }
}
