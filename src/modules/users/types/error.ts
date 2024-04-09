import { QueryFailedError } from 'typeorm'
import { BaseOptionException } from 'src/types/error'

export class UserNotFoundException extends BaseOptionException<'UserNotFoundException'> {
  constructor(error?: QueryFailedError) {
    super(error)
  }

  type = 'UserNotFoundException' as const
}

export class UserAlreadyExistException extends BaseOptionException<'UserAlreadyExistException'> {
  constructor(error?: QueryFailedError) {
    super(error)
  }

  type = 'UserAlreadyExistException' as const
}
