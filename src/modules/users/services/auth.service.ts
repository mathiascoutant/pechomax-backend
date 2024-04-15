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

//   async signup({
//     email,
//     password,
//     username,
//     role,
//   }: CreateUserDto): Promise<Option<CleanUser, UserAlreadyExistException | BaseError>> {
//     const hashedPassword = await this.hashPassword(password)

//     const user = {
//       email,
//       password: hashedPassword,
//       username,
//       role,
//     }

//     const savedUser = await this.userService.create(user)

//     if (savedUser.isErr()) {
//       return savedUser
//     }

//     return Ok(savedUser.content)
//   }

//   async login({
//     email,
//     password,
//   }: {
//     email: string
//     password: string
//   }): Promise<Option<{ access_token: string }, WrongPasswordException | UserNotFoundException | BaseError>> {
//     const user = await this.userService.finOneByEmail(email, true)

//     if (user.isErr()) {
//       return user
//     }

//     const isMatch = await compare(password, user.content.password)

}
