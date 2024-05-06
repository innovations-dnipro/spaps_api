import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { FileUploadService } from './file-upload.service'
import { PublicFile } from './public-file.entity'

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([PublicFile])],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
