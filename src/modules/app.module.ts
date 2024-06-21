import * as dotenv from 'dotenv'

import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'

import { CoreModule } from '@spaps/core/core-module/core.module'
import { User } from '@spaps/core/core-module/user/user.entity'

import { TypeORMConfig } from '@spaps/config'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { Client } from './client/client.entity'
import { ClientModule } from './client/client.module'
import { Complex } from './complex/complex.entity'
import { ComplexModule } from './complex/complex.module'
import { FileUploadModule } from './file-upload/file-upload.module'
import { PublicFile } from './file-upload/public-file.entity'
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
      entities: [User, Rentor, Client, Complex, PublicFile],
    } as TypeOrmModuleOptions),
    CoreModule,
    AuthModule,
    TaskModule,
    ClientModule,
    ComplexModule,
    RentorModule,
    FileUploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
