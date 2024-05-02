import { Queue } from 'bull'

import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'

import { EEmailVariant, EProcess, ETask } from '@spaps/core/enums'

@Injectable()
export class TaskService {
  constructor(
    @InjectQueue(ETask.SEND_CODE)
    private sendCode: Queue,
  ) {}

  addSendCodeTask(data: {
    code: string
    variant: EEmailVariant
    email: string
    firstName: string
    lastName: string
  }) {
    return this.sendCode.add(EProcess.TRANSCODE, data)
  }
}
