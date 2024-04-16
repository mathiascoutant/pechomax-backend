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

}
