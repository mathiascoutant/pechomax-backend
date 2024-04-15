import { Module, ValidationPipe } from '@nestjs/common'
import { UsersService } from './services/users.service'
import { UsersController } from './controllers/users.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/entities/user.entity'
import { JwtModule } from '@nestjs/jwt'
import { AuthService } from './services/auth.service'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule.register({}), ConfigModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    {
      provide: 'APP_PIPE',
      useValue: new ValidationPipe({
        transform: true,
      }),
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
