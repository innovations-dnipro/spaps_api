import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { FileUploadModule } from '@spaps/modules/file-upload/file-upload.module'
import { PublicFile } from '@spaps/modules/file-upload/public-file.entity'

import { CoreModule } from '@spaps/core/core-module/core.module'

import { ClientController } from './client.controller'
import { Client } from './client.entity'
import { ClientService } from './client.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, PublicFile]),
    CoreModule,
    FileUploadModule,
  ],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
