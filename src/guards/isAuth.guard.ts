import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import type { FastifyRequest } from 'fastify'
import { Payload } from 'src/types/payload'

@Injectable()
export class IsAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>()
    const token = req.cookies?.['access_token']

    if (!token) {
      throw new UnauthorizedException()
    }

    try {
      const payload = await this.jwtService.verifyAsync<Payload>(token, {
        secret: this.configService.get('JWT_SECRET'),
      })

      req['payload'] = payload
    } catch {
      throw new UnauthorizedException()
    }

    return true
  }
}
