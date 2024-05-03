import * as dotenv from 'dotenv'

import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'

import { TypeORMConfig } from '@spaps/config'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { Client } from './client/client.entity'
import { ClientModule } from './client/client.module'
import { CoreModule } from './core-module/core.module'
import { User } from './core-module/user/user.entity'
import { Rentor } from './rentor/rentor.entity'
import { RentorModule } from './rentor/rentor.module'
import { TaskModule } from './task/task.module'

dotenv.config()

@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
      envFilePath: ['stack.env'], //NOTE: for dev mode, use .serve.env; for prod mode, use stack.env
    }),
    TypeOrmModule.forRoot({
      ...TypeORMConfig,
      entities: [User, Rentor, Client],
    } as TypeOrmModuleOptions),
    CoreModule,
    AuthModule,
    TaskModule,
    ClientModule,
    RentorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
