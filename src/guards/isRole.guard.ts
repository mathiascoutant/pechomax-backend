import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRoles } from 'src/modules/users/types/utilities'
import { Payload } from 'src/types/payload'

@Injectable()
export class IsRole implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request
    const token = req['token'] as Payload

    if (!token) {
      throw new InternalServerErrorException()
    }

    const roles = this.reflector.get<Array<UserRoles>>('roles', context.getHandler())

    if (!roles.includes(token.role)) {
      throw new UnauthorizedException()
    }
    return true
  }
}
