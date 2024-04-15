import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from './users.service'
import { compare, genSalt, hash } from 'bcrypt'
import { Option, Err, Ok } from 'src/types/option'
import { Payload } from 'src/types/payload'
import { CleanUser } from '../types/utilities'
import { CreateUserDto } from '../dto/create-user.dto'
import { BaseError } from 'src/types/error'
import { UserAlreadyExistException, UserNotFoundException, WrongPasswordException } from '../types/error'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt()
    const hashedPassword = await hash(password, salt)

    return hashedPassword
  }

  async signup({
    email,
    password,
    username,
    role,
  }: CreateUserDto): Promise<Option<{ access_token: string; user: CleanUser }, UserAlreadyExistException | BaseError>> {
    const hashedPassword = await this.hashPassword(password)

    const savedUser = await this.userService.create({
      email,
      password: hashedPassword,
      username,
      role,
    })

    if (savedUser.isErr()) {
      return savedUser
    }

    const payload: Payload = {
      id: savedUser.content.id,
      role: savedUser.content.role,
      username: savedUser.content.username,
    }

    return Ok({
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
      }),
      user: savedUser.content,
    })
  }


//     if (user.isErr()) {
//       return user
//     }

//     const isMatch = await compare(password, user.content.password)

}
