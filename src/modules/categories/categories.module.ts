import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'
import { Category } from 'src/entities/category.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Category]), JwtModule.register({}), ConfigModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class CategoriesModule {}
