import * as cookieParser from 'cookie-parser'
import * as dotenv from 'dotenv'
import 'module-alias/register'

import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from '@spaps/modules/app.module'

import { convertType } from '@spaps/core/utils'

dotenv.config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SPAPS')
    .setDescription('SPAPS API description')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)

  app.enableCors({
    origin: JSON.parse(process.env.CORS_ORIGIN_ARRAY),
    credentials: convertType(process.env.CORS_WITH_CREDENTIALS) as boolean,
  })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  app.use(cookieParser())
  SwaggerModule.setup('api', app, document)
  await app.listen(3000, '0.0.0.0')

  console.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap()
