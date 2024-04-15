import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import fastifyCookie from '@fastify/cookie'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())
  app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
  })
  await app.listen(3000)
}
bootstrap()
