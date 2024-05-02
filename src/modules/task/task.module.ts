import * as dotenv from 'dotenv'

import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

import { ETask } from '@spaps/core/enums'

import { SendEmailProcessor } from './processors/auth.queue.service'
import { TaskService } from './task.service'

dotenv.config()

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: async () => ({
        name: ETask.TASKS, // Name of the queue
        redis: {
          host: process.env.REDIS_HOSTNAME,
          port: parseInt(process.env.REDIS_PRIMARY_PORT),
        },
      }),
    }), // Register Bull queue module
    BullModule.registerQueue({
      name: ETask.SEND_CODE,
      redis: {
        host: process.env.REDIS_HOSTNAME,
        port: parseInt(process.env.REDIS_PRIMARY_PORT),
      },
    }),
  ],
  providers: [SendEmailProcessor, TaskService],
  exports: [TaskService],
})
export class TaskModule {}
