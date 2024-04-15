import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, Length } from 'class-validator'
import { UserRoles } from '../types/utilities'

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @Length(3)
  username!: string

  @IsEmail()
  @IsOptional()
  email!: string

  @IsString()
  @IsOptional()
  @Length(8)
  password!: string

  @IsString()
  @IsOptional()
  @IsEnum(['User', 'Admin'])
  role?: UserRoles

  @IsString()
  @IsOptional()
  phone_number?: string

  @IsString()
  @IsOptional()
  profile_pic?: string

  @IsString()
  @IsOptional()
  city?: string

  @IsString()
  @IsOptional()
  region?: string

  @IsString()
  @IsOptional()
  zip_code?: string

  @IsNumber()
  @IsOptional()
  score?: number
}
