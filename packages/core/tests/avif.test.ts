import { describe, expect, it } from '@effect/vitest'
import { Effect } from 'effect'
import { NodeServices } from '@effect/platform-node'
import { avifLosslessCompressor, avifLossyCompressor } from '../src'
import { loadFixture } from '../src/utils'

describe('AVIF Compressor', () => {
  it.effect('lossy compressed buffer must smaller or equal', () =>
    Effect.gen(function* () {
      const fixture = yield* loadFixture('../../fixtures/moon.png')

      const buffer = yield* avifLossyCompressor(fixture, { quality: 70, alphaQuality: 70 })

      expect(buffer.length).toBeLessThanOrEqual(fixture.length)
    }).pipe(Effect.provide(NodeServices.layer)),
  )

  it.effect('lossless compressed buffer must smaller or equal', () =>
    Effect.gen(function* () {
      const fixture = yield* loadFixture('../../fixtures/moon.png')
      const buffer = yield* avifLosslessCompressor(fixture)

      expect(buffer.length).toBeLessThanOrEqual(fixture.length)
    }).pipe(Effect.provide(NodeServices.layer)),
  )
})
