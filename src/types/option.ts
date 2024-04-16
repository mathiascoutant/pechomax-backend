import { BaseOptionException } from './error'

interface OptionBase<T, K extends BaseOptionException> {
  isOk(): this is Ok<T>
  isErr(): this is Err<K>
}

interface Ok<T> extends OptionBase<T, null> {
  content: T
}

interface Err<K extends BaseOptionException> extends OptionBase<null, K> {
  error: K
}

export type Option<T, K extends BaseOptionException> = Ok<T> | Err<K>

export const Ok = function <T>(content: T): Option<T, null> {
  return {
    content,
    isOk() {
      return true
    },
    isErr() {
      return false
    },
  }
}

export const Err = function <K extends BaseOptionException>(error: K): Option<null, K> {
  return {
    error,
    isOk() {
      return false
    },
    isErr() {
      return true
    },
  }
}
