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

  @Post('create')
  async createCategory(@Body() updateCategoryDto: CreateCategoryDto, @Res() res: FastifyReply) {
    const category = await this.categoryService.create(updateCategoryDto)

    if (category.isErr()) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error')
    }

    return res.status(HttpStatus.OK).send(category.content)
  }
}
