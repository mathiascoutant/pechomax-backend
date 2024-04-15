import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/entities/user.entity'
import { QueryFailedError, Repository, TypeORMError } from 'typeorm'
import { Err, Ok, Option } from 'src/types/option'
import { CreateUserDto } from '../dto/create-user.dto'
import { CleanUser } from '../types/utilities'
import { UserAlreadyExistException, UserNotFoundException } from '../types/error'
import { BaseError, DatabaseInternalError, UnknownError } from 'src/types/error'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  async create(userDatas: CreateUserDto): Promise<Option<CleanUser, UserAlreadyExistException | BaseError>> {
    const user = new User(userDatas)

    try {
      const savedUser = await this.userRepository.save(user)

      delete savedUser.password

      return Ok(savedUser)
    } catch (error) {
      if (error instanceof QueryFailedError) {
        return Err(new UserAlreadyExistException(error))
      }

      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error))
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error))
      }
    }
  }

  async findAll(): Promise<Option<Array<CleanUser>, BaseError>> {
    try {
      const users = await this.userRepository.find()

      return Ok(users)
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error))
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error))
      }
    }
  }

  async findOne(id: string): Promise<Option<CleanUser, UserNotFoundException | BaseError>>
  async findOne(id: string, withPassword: false): Promise<Option<CleanUser, UserNotFoundException | BaseError>>
  async findOne(id: string, withPassword: true): Promise<Option<User, UserNotFoundException | BaseError>>
  async findOne(
    id: string,
    withPassword = false
  ): Promise<Option<CleanUser | User, UserNotFoundException | BaseError>> {
    try {
      const user = withPassword
        ? await this.userRepository
            .createQueryBuilder('user')
            .where('user.id = :id', { id })
            .addSelect('user.password')
            .getOne()
        : await this.userRepository.findOne({ where: { id } })

      if (!user) {
        return Err(new UserNotFoundException())
      }

      return Ok(user)
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error))
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error))
      }
    }
  }

  async findOneByEmail(email: string): Promise<Option<CleanUser, UserNotFoundException | BaseError>>
  async findOneByEmail(
    email: string,
    withPassword: false
  ): Promise<Option<CleanUser, UserNotFoundException | BaseError>>
  async findOneByEmail(email: string, withPassword: true): Promise<Option<User, UserNotFoundException | BaseError>>
  async findOneByEmail(
    email: string,
    withPassword = false
  ): Promise<Option<CleanUser | User, UserNotFoundException | BaseError>> {
    try {
      const user = withPassword
        ? await this.userRepository
            .createQueryBuilder('user')
            .where('user.email = :email', { email })
            .addSelect('user.password')
            .getOne()
        : await this.userRepository.findOne({ where: { email } })

      if (!user) {
        return Err(new UserNotFoundException())
      }

      return Ok(user)
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error))
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error))
      }
    }
  }

  async findOneByUsername(username: string): Promise<Option<CleanUser, UserNotFoundException | BaseError>>
  async findOneByUsername(
    username: string,
    withPassword: false
  ): Promise<Option<CleanUser, UserNotFoundException | BaseError>>
  async findOneByUsername(
    username: string,
    withPassword: true
  ): Promise<Option<User, UserNotFoundException | BaseError>>
  async findOneByUsername(
    username: string,
    withPassword = false
  ): Promise<Option<CleanUser | User, UserNotFoundException | BaseError>> {
    try {
      const user = withPassword
        ? await this.userRepository
            .createQueryBuilder('user')
            .where('user.username = :username', { username })
            .addSelect('user.password')
            .getOne()
        : await this.userRepository.findOne({ where: { username } })

      if (!user) {
        return Err(new UserNotFoundException())
      }

      return Ok(user)
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error))
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error))
      }
    }
  }
}
