import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'

import { CoreModule } from '@spaps/modules/core-module/core.module'
import { UserModule } from '@spaps/modules/core-module/user/user.module'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  imports: [CoreModule, UserModule, CacheModule.register()],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
