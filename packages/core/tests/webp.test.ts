import { describe, expect, it } from '@effect/vitest'
import { Effect } from 'effect'
import { NodeServices } from '@effect/platform-node'
import { webpLosslessCompressor, webpLossyCompressor } from '../src'
import { loadFixture } from '../src/utils'

describe('WebP Compressor', () => {
  it.effect('lossless compressed buffer must smaller or equal', () =>
    Effect.gen(function* () {
      const fixture = yield* loadFixture('../../fixtures/moon.png')
      const buffer = yield* webpLosslessCompressor(fixture)

      expect(buffer.length).toBeLessThanOrEqual(fixture.length)
    }).pipe(Effect.provide(NodeServices.layer)),
  )

  it.effect('lossy compressed buffer must smaller or equal', () =>
    Effect.gen(function* () {
      const fixture = yield* loadFixture('../../fixtures/moon.png')
      const buffer = yield* webpLossyCompressor(fixture, { quality: 70 })

      expect(buffer.length).toBeLessThanOrEqual(fixture.length)
    }).pipe(Effect.provide(NodeServices.layer)),
  )
})
