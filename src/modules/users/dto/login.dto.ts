import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator'

export class LoginDto {
  @IsOptional()
  @IsString()
  @Length(3)
  username?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsNotEmpty()
  @IsString()
  @Length(8)
  password!: string
}
