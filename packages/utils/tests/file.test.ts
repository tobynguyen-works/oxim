import { describe, it, expect } from '@effect/vitest'
import { Effect, FileSystem, Path } from 'effect'
import { NodeServices } from '@effect/platform-node'
import { getImageMeta } from '../src'

describe('image-meta Effect wrappers', () => {
  it.effect('should correctly extract metadata from a PNG file', () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const path = yield* Path.Path

      const imagePath = path.join(import.meta.dirname, '..', 'fixtures/icon.png')
      const buffer = yield* fs.readFile(imagePath)
      const data = yield* getImageMeta(buffer)

      expect(data).toBeDefined()
      expect(data.type).toBe('png')
      expect(data.width).toBeTypeOf('number')
      expect(data.width).toBeGreaterThan(0)
      expect(data.height).toBeTypeOf('number')
      expect(data.height).toBeGreaterThan(0)
    }).pipe(Effect.provide(NodeServices.layer)),
  )
})
