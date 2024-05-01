import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { CoreModule } from '@spaps/modules/core-module/core.module'
import { UserModule } from '@spaps/modules/core-module/user/user.module'

import { ClientController } from './client.controller'
import { Client } from './client.entity'
import { ClientService } from './client.service'

@Module({
  imports: [TypeOrmModule.forFeature([Client]), CoreModule, UserModule],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
