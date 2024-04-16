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

  @Get()
  async getAll(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const categoryList = await this.categoryService.findAll()

    if (categoryList.isErr()) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error')
    }

    return res.status(HttpStatus.OK).send(categoryList.content)
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Res() res: FastifyReply) {
    const category = await this.categoryService.findOne(id)

    if (category.isErr()) {
      const { error } = category

      if (error.type === 'CategoryNotFoundException') {
        return res.status(HttpStatus.NOT_FOUND).send(category.error)
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error')
    }

    return res.status(HttpStatus.OK).send(category.content)
  }

  @Put('update/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: CreateCategoryDto,
    @Res() res: FastifyReply
  ) {
    const category = await this.categoryService.updateOne(id, updateCategoryDto)

    if (category.isErr()) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error')
    }

    return res.status(HttpStatus.OK).send(category.content)
  }

  @Delete('delete/:id')
  async deleteCategory(@Param('id') id: string, @Res() res: FastifyReply) {
    const affected = await this.categoryService.deleteOne(id)

    if (affected.isErr()) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error')
    }

    return res.status(HttpStatus.OK).send(affected.content)
  }
}
