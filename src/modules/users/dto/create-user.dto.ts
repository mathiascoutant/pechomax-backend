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

  @IsString()
  @IsNotEmpty()
  @Length(10)
  phone_number: string

  @IsString()
  @IsNotEmpty()
  city: string

  @IsString()
  @IsNotEmpty()
  zip_code: string
}
