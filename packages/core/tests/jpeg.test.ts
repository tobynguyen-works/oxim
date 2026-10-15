import { describe, expect, it } from '@effect/vitest'
import { Effect } from 'effect'
import { NodeServices } from '@effect/platform-node'
import { jpegLosslessCompressor, jpegLossyCompressor } from '../src'
import { loadFixture } from '../src/utils'

describe('JPEG Compressor', () => {
  it.effect('lossy compressed buffer must smaller or equal', () =>
    Effect.gen(function* () {
      const fixture = yield* loadFixture('../../fixtures/un-optimized.jpg')
      const buffer = yield* jpegLossyCompressor(fixture, { quality: 80 })

      expect(buffer.length).toBeLessThanOrEqual(fixture.length)
    }).pipe(Effect.provide(NodeServices.layer)),
  )

  it.effect('lossless compressed buffer must smaller or equal', () =>
    Effect.gen(function* () {
      const fixture = yield* loadFixture('../../fixtures/un-optimized.jpg')
      const buffer = yield* jpegLosslessCompressor(fixture)

      expect(buffer.length).toBeLessThanOrEqual(fixture.length)
    }).pipe(Effect.provide(NodeServices.layer)),
  )
})
