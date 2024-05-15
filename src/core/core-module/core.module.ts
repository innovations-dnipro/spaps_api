import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'

import { JwtStrategy } from './jwt.strategy'
import { UserModule } from './user/user.module'

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: () => {
        return {
          secret: process.env.AUTH_TOKEN_SECRET,
        }
      },
      extraProviders: [ConfigService],
      inject: [ConfigService],
    }),
    UserModule,
  ],
  providers: [JwtStrategy],
  exports: [JwtStrategy, ConfigModule, UserModule, JwtModule],
})
export class CoreModule {}
