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

  @Post('auth/register')
  async signup(@Body() createUserDto: CreateUserDto, @Res() res: FastifyReply) {
    const register = await this.authService.register(createUserDto)

    if (register.isErr()) {
      const { error } = register

      if (error.type === 'UserAlreadyExistException') {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('This user already exist')
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error')
    }

    res.setCookie('access_token', register.content.access_token)

    return res.status(HttpStatus.CREATED).send(register.content.user)
  }

  @Post('auth/login')
  async login(@Body() loginDto: LoginDto, @Res() res: FastifyReply) {
    const login = await this.authService.login(loginDto)

    if (login.isErr()) {
      const { error } = login
      if (error.type === 'WrongPasswordException') {
        return res.status(HttpStatus.UNAUTHORIZED).send('Wrong credentials')
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error')
    }

    res.setCookie('access_token', login.content.access_token)

    return res.status(HttpStatus.CREATED).send(login.content.user)
  }

}
