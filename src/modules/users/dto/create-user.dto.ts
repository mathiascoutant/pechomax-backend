import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator'
import { UserRoles } from '../types/utilities'

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(3)
  username!: string

  @IsNotEmpty()
  @IsEmail()
  email!: string

  @IsNotEmpty()
  @IsString()
  @Length(8)
  password!: string

  @IsString()
  @IsOptional()
  @IsEnum(['User', 'Admin'])
  role?: UserRoles
}
