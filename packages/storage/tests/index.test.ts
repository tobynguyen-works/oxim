import { describe, it, expect } from '@effect/vitest'
import { Effect, FileSystem, Layer, Path } from 'effect'
import { createStorageService, StorageService } from '../src'
import { NodeServices } from '@effect/platform-node'

describe('Storage', () => {
  const StorageLive = Layer.effect(
    StorageService,
    Effect.gen(function* () {
      const path = yield* Path.Path
      const fs = yield* FileSystem.FileSystem

      const cacheFolder = path.join(import.meta.dirname, '../node_modules/', 'testFolder')

      yield* Effect.addFinalizer(() =>
        fs.remove(cacheFolder, { recursive: true }).pipe(Effect.ignore),
      )

      return yield* createStorageService(cacheFolder)
    }),
  ).pipe(Layer.provide(NodeServices.layer))

  it.effect('should set and get an item successfully', () =>
    Effect.scoped(
      Effect.gen(function* () {
        const storage = yield* StorageService

        yield* storage.setItem('test-key', 'hello effect')
        const value = yield* storage.getItem('test-key')

        expect(value).toBe('hello effect')
      }),
    ).pipe(Effect.provide(StorageLive)),
  )

  it.effect('should return null for non-existent items', () =>
    Effect.scoped(
      Effect.gen(function* () {
        const storage = yield* StorageService

        const value = yield* storage.getItem('non-existent')

        expect(value).toBeNull()
      }),
    ).pipe(Effect.provide(StorageLive)),
  )

  it.effect('should remove an item successfully', () =>
    Effect.scoped(
      Effect.gen(function* () {
        const storage = yield* StorageService

        yield* storage.setItem('key-to-remove', 'some value')
        yield* storage.removeItem('key-to-remove')

        const value = yield* storage.getItem('key-to-remove')

        expect(value).toBeNull()
      }),
    ).pipe(Effect.provide(StorageLive)),
  )

  it.effect(
    'should return empty array when no keys exist and all stored keys when items are present',
    () =>
      Effect.scoped(
        Effect.gen(function* () {
          const storage = yield* StorageService

          const initialKeys = yield* storage.getKeys
          expect(initialKeys).toEqual([])

          yield* storage.setItem('user:1', 'Alice')
          yield* storage.setItem('user:2', 'Bob')
          yield* storage.setItem('settings:theme', 'dark')

          const keys = yield* storage.getKeys

          expect(keys.sort()).toEqual(['settings:theme', 'user:1', 'user:2'].sort())
        }),
      ).pipe(Effect.provide(StorageLive)),
  )
})
