import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common'
import { type FastifyRequest, type FastifyReply } from 'fastify'
import { IsAuthGuard } from 'src/guards/isAuth.guard'
import { Roles } from 'src/decorators/roles.decorator'
import { IsRole } from 'src/guards/isRole.guard'
import { CategoriesService } from '../services/categories.service'
import { CreateCategoryDto } from '../dto/create-category.dto'

@Roles('Admin')
@UseGuards(IsAuthGuard, IsRole)
@Controller('users')
export class UsersController {
  constructor(private readonly categoryService: CategoriesService) {}

}
