import { TypeORMError } from 'typeorm'

export abstract class BaseOptionException extends Error {
  constructor(public error?: Error) {
    super('')
    BaseOptionException.name
  }

  abstract readonly type: string
}

export class UnknownError extends BaseOptionException {
  constructor(error: Error) {
    super(error)
  }

  type = 'UnknownError' as const
}

export class DatabaseInternalError extends BaseOptionException {
  constructor(error: TypeORMError) {
    super(error)
  }

  type = 'DatabaseInternalError' as const
}

export type BaseError = DatabaseInternalError | UnknownError
