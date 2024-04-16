import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { QueryFailedError, Repository, TypeORMError } from 'typeorm'
import { Err, Ok, Option } from 'src/types/option'
import { BaseError, DatabaseInternalError, UnknownError } from 'src/types/error'
import { Category } from 'src/entities/category.entity'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { CategoryNotFoundException, NameAlreadyExistException } from '../types/error'

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private readonly categoryRepository: Repository<Category>) {}

  async create(userDatas: CreateCategoryDto): Promise<Option<Category, NameAlreadyExistException | BaseError>> {
    const user = new Category(userDatas)

    try {
      const savedCategory = await this.categoryRepository.save(user)

      return Ok(savedCategory)
    } catch (error) {
      if (error instanceof QueryFailedError) {
        return Err(new NameAlreadyExistException(error))
      }

      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error))
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error))
      }
    }
  }

  async findAll(): Promise<Option<Array<Category>, BaseError>> {
    try {
      const categories = await this.categoryRepository.find()

      return Ok(categories)
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error))
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error))
      }
    }
  }

  async findOne(id: string): Promise<Option<Category, CategoryNotFoundException | BaseError>> {
    try {
      const user = await this.categoryRepository.findOne({ where: { id } })

      if (!user) {
        return Err(new CategoryNotFoundException())
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
