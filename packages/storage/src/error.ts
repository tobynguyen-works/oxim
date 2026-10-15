import { Data } from 'effect'

export class StorageError extends Data.TaggedError('StorageError')<{
  readonly cause: unknown
  readonly message: string
}> {}
