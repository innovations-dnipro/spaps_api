import { Job } from 'bull'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as Handlebars from 'handlebars'
import * as sendpulse from 'sendpulse-api'

import {
  OnQueueActive,
  OnQueueError,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull'

import { EEmailVariant, EProcess, ETask } from '@spaps/core/enums'

dotenv.config()

const emailSubject = {
  [EEmailVariant.EMAIL_REGISTRATION]: 'SPAPS реєстрація',
  [EEmailVariant.PASSWORD_CHANGE]: 'SPAPS зміна паролю',
  [EEmailVariant.EMAIL_CHANGE]: 'Spaps зміна електронної пошти',
}

const emailText = {
  [EEmailVariant.EMAIL_REGISTRATION]:
    'Ваш код для підтвердження адреси електронної пошти:',
  [EEmailVariant.PASSWORD_CHANGE]: 'Ваш код для підтвердження зміни пароля:',
  [EEmailVariant.EMAIL_CHANGE]:
    'Ваш код для підтвердження зміни адреси електронної пошти:',
}

@Processor(ETask.SEND_CODE)
export class SendEmailProcessor {
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

  @Process(EProcess.TRANSCODE)
  async sendCode(payload: {
    data: {
      code: string
      variant: EEmailVariant
      email: string
      firstName: string
      lastName: string
    }
  }) {
    const { code, variant, email, firstName, lastName } = payload?.data
    const API_USER_ID = process.env.SENDPULSE_API_USER
    const API_SECRET = process.env.SENDPULSE_API_SECRET
    const TOKEN_STORAGE = process.env.SENDPULSE_TOKEN_STORAGE

    const template = Handlebars.compile(
      fs.readFileSync('src/email-templates/email.confirmation.hbs', 'utf8'),
    )
    const answerGetter = function (data) {
      console.log({ answerGetter: data })
    }

    sendpulse.init(API_USER_ID, API_SECRET, TOKEN_STORAGE, function () {
      sendpulse.smtpSendMail(answerGetter, {
        html: template({
          subject: emailSubject[variant],
          text: emailText[variant],
          code,
        }),
        subject: emailSubject[variant],
        from: {
          name: process.env.SENDPULSE_SENDER_NAME,
          email: process.env.SENDPULSE_SENDER_EMAIL_ADDRESS,
        },
        to: [
          {
            name: `${firstName} ${lastName}`,
            email,
          },
        ],
      })
    })
  }
}
