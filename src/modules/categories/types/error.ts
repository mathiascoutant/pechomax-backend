import { BaseOptionException } from 'src/types/error'
import { QueryFailedError } from 'typeorm'

export class NameAlreadyExistException extends BaseOptionException {
  constructor(error?: QueryFailedError) {
    super(error)
  }

  type = 'NameAlreadyExistException' as const
}

export class CategoryNotFoundException extends BaseOptionException {
  constructor(error?: QueryFailedError) {
    super(error)
  }

  type = 'CategoryNotFoundException' as const
}
