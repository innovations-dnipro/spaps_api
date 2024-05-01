import * as dotenv from 'dotenv'

import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'

import { TypeORMConfig } from '@spaps/config'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { ClientModule } from './client/client.module'

dotenv.config()

@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
      envFilePath: ['.env'], //NOTE: for dev mode, use .serve.env; for prod mode, use stack.env
    }),
    TypeOrmModule.forRoot({
      ...TypeORMConfig,
      entities: [],
    } as TypeOrmModuleOptions),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PRIMARY_PORT),
      },
    }),
    AuthModule,
    ClientModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
