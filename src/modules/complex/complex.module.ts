import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { FileUploadModule } from '@spaps/modules/file-upload/file-upload.module'
import { PublicFile } from '@spaps/modules/file-upload/public-file.entity'
import { RentorModule } from '@spaps/modules/rentor/rentor.module'

import { CoreModule } from '@spaps/core/core-module/core.module'

import { ComplexController } from './complex.controller'
import { Complex } from './complex.entity'
import { ComplexService } from './complex.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Complex, PublicFile]),
    CoreModule,
    FileUploadModule,
    RentorModule,
  ],
  controllers: [ComplexController],
  providers: [ComplexService],
  exports: [ComplexService],
})
export class ComplexModule {}
