import { Context, Effect } from 'effect'
import pkg from '../package.json'
import { createStorage } from 'unstorage'
import fsLite from 'unstorage/drivers/fs-lite'
import { promise, tryPromise } from 'effect/Effect'
import { StorageError } from './error'

export class StorageService extends Context.Service<
  StorageService,
  {
    readonly getItem: (key: string) => Effect.Effect<string | null, StorageError>
    readonly setItem: (key: string, value: string) => Effect.Effect<void, StorageError>
    readonly removeItem: (key: string) => Effect.Effect<void, StorageError>
    readonly getKeys: Effect.Effect<string[], StorageError>
  }
>()(`${pkg.name}/Storage`) {}

const handleStorageError = (error: unknown) =>
  new StorageError({
    cause: error,
    message: error instanceof Error ? error.message : String(error),
  })

export const createStorageService = (folderPath: string) =>
  Effect.scoped(
    Effect.gen(function* () {
      const storage = createStorage({
        driver: fsLite({ base: folderPath }),
      })

      yield* Effect.addFinalizer(() => promise(() => storage.dispose()))

      return {
        getItem: (key: string) =>
          tryPromise({
            try: () => storage.getItem(key) as Promise<string | null>,
            catch: handleStorageError,
          }),
        setItem: (key: string, value: string) =>
          tryPromise({
            try: () => storage.set(key, value),
            catch: handleStorageError,
          }),
        removeItem: (key: string) =>
          tryPromise({
            try: () => storage.removeItem(key),
            catch: handleStorageError,
          }),
        getKeys: tryPromise({
          try: () => storage.getKeys(),
          catch: handleStorageError,
        }),
      }
    }),
  )
