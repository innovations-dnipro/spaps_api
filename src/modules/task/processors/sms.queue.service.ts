import { Job } from 'bull'
import * as dayjs from 'dayjs'
import * as dotenv from 'dotenv'
import * as sendpulse from 'sendpulse-api'

import {
  OnQueueActive,
  OnQueueError,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull'

import { EProcess, ETask } from '@spaps/core/enums'

dotenv.config()

@Processor(ETask.SEND_SMS)
export class SendSMSProcessor {
  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      'Processing job ${job.id} of type ${job.name} with data ${job.data}...,',
    )
  }

  @OnQueueFailed()
  onFailed(error) {
    console.log({ onFailed: error })
  }

  @OnQueueError()
  onError(error) {
    console.log({ onError: error })
  }

  @Process(EProcess.TRANSSMS)
  async sendSMS(payload: {
    data: {
      code: string
      phone: string
    }
  }) {
    const { code, phone } = payload?.data
    const API_USER_ID = process.env.SENDPULSE_API_USER
    const API_SECRET = process.env.SENDPULSE_API_SECRET
    const TOKEN_STORAGE = process.env.SENDPULSE_TOKEN_STORAGE

    const answerGetter = function (data) {
      console.log({ answerGetter: data })
    }

    // const fullDate = dayjs().format('YYYY-MM-DD hh:mm:ss')
    // console.log({
    //   phone,
    //   code,
    //   fullDate,
    // })

    sendpulse.init(API_USER_ID, API_SECRET, TOKEN_STORAGE, function () {
      sendpulse.smsSend(
        answerGetter,
        'SPAPS',
        [phone],
        `Ваш код для підтвердження: ${code}`,
        undefined, //fullDate
        1,
        undefined,
      )
    })
  }
}
