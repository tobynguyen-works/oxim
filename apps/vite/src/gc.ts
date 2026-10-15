import { ConfigService } from '@oxim/core'
import { StorageService } from '@oxim/storage'
import { Effect, pipe } from 'effect'

export const garbageCollector = (cacheKeys: string[]) =>
  Effect.gen(function* () {
    const storage = yield* StorageService
    const config = yield* ConfigService

    const availableCache = yield* storage.getKeys

    const activeKeysSet = new Set(cacheKeys)

    yield* pipe(
      availableCache,
      (keys) => keys.filter((key) => !activeKeysSet.has(key)),
      Effect.forEach((key) => storage.removeItem(key), { concurrency: config.concurrency }),
    )
  })
