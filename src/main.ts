import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import fastifyCookie from '@fastify/cookie'
import { ConfigService } from '@nestjs/config'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())
  const config = app.get(ConfigService)
  app.register(fastifyCookie, {
    secret: config.get('COOKIE_SECRET'),
  })

  await app.listen(3000, '0.0.0.0')
}
bootstrap()
