import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common'
import { UsersService } from '../services/users.service'
import { CreateUserDto } from '../dto/create-user.dto'
import { LoginDto } from '../dto/login.dto'
import { type FastifyRequest, type FastifyReply } from 'fastify'
import { AuthService } from '../services/auth.service'
import { Payload } from 'src/types/payload'
import { IsAuthGuard } from 'src/guards/isAuth.guard'

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService
  ) {}

}
