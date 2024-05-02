import * as dotenv from 'dotenv'

import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'

import { TypeORMConfig } from '@spaps/config'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { ClientModule } from './client/client.module'
import { TaskModule } from './task/task.module'

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
    AuthModule,
    ClientModule,
    TaskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
