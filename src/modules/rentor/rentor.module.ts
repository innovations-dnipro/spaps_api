import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { CoreModule } from '@spaps/modules/core-module/core.module'

import { RentorController } from './rentor.controller'
import { Rentor } from './rentor.entity'
import { RentorService } from './rentor.service'

@Module({
  imports: [TypeOrmModule.forFeature([Rentor]), CoreModule],
  controllers: [RentorController],
  providers: [RentorService],
  exports: [RentorService],
})
export class RentorModule {}
