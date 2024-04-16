import { QueryFailedError } from 'typeorm'
import { BaseOptionException } from 'src/types/error'

export class UserNotFoundException extends BaseOptionException {
  constructor(error?: QueryFailedError) {
    super(error)
  }

  type = 'UserNotFoundException' as const
}

export class UserAlreadyExistException extends BaseOptionException {
  constructor(error?: QueryFailedError) {
    super(error)
  }

  type = 'UserAlreadyExistException' as const
}

export class WrongPasswordException extends BaseOptionException {
  constructor(error?: QueryFailedError) {
    super(error)
  }

  type = 'WrongPasswordException' as const
}
