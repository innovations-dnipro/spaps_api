import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'

import { ClientModule } from '@spaps/modules/client/client.module'
import { CoreModule } from '@spaps/modules/core-module/core.module'
import { RentorModule } from '@spaps/modules/rentor/rentor.module'
import { TaskModule } from '@spaps/modules/task/task.module'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  imports: [
    CoreModule,
    CacheModule.register(),
    TaskModule,
    ClientModule,
    RentorModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
