import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common'
import { UsersService } from '../services/users.service'
import { CreateUserDto } from '../dto/create-user.dto'
import { LoginDto } from '../dto/login.dto'
import { type FastifyRequest, type FastifyReply } from 'fastify'
import { AuthService } from '../services/auth.service'
import { Payload } from 'src/types/payload'
import { IsAuthGuard } from 'src/guards/isAuth.guard'
import { UpdateUserDto } from '../dto/update-user.dto'

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

  @UseGuards(IsAuthGuard)
  @Get('self')
  async getSelf(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const { id } = req['payload'] as Payload

    const user = await this.userService.findOne(id)

    if (user.isErr()) {
      const { error } = user

      if (error.type === 'UserNotFoundException') {
        return res.status(HttpStatus.NOT_FOUND).send(user.error)
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error')
    }

    return res.status(HttpStatus.OK).send(user.content)
  }

  @Get()
  async getUsers(@Res() res: FastifyReply) {
    const users = await this.userService.findAll()

    if (users.isErr()) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error')
    }

    return res.status(HttpStatus.OK).send(users.content)
  }

  @Get(':username')
  async getUser(@Param('username') username: string, @Res() res: FastifyReply) {
    const user = await this.userService.findOneByUsername(username)

    if (user.isErr()) {
      const { error } = user

      if (error.type === 'UserNotFoundException') {
        return res.status(HttpStatus.NOT_FOUND).send(user.error)
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error')
    }

    return res.status(HttpStatus.OK).send(user.content)
  }

  @UseGuards(IsAuthGuard)
  @Post('/update/:id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Res() res: FastifyReply) {
    const user = await this.userService.updateOne(id, updateUserDto)

    if (user.isErr()) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error')
    }

    return res.status(HttpStatus.OK).send(user.content)
  }

  @UseGuards(IsAuthGuard)
  @Delete('delete/:id')
  async deleteUser(@Param('id') id: string, @Res() res: FastifyReply) {
    const affected = await this.userService.deleteOne(id)

    if (affected.isErr()) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error')
    }

    return res.status(HttpStatus.OK).send(affected.content)
  }
}
