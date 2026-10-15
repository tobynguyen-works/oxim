import { NodeServices } from '@effect/platform-node'
import { describe, expect, it } from '@effect/vitest'
import { Effect } from 'effect'
import { pngLosslessCompressor, pngLossyCompressor } from '../src'
import { loadFixture } from '../src/utils'

describe('PNG Compressor', () => {
  it.effect('lossy compressed buffer must smaller or equal', () =>
    Effect.gen(function* () {
      const fixture = yield* loadFixture('../../fixtures/moon.png')
      const buffer = yield* pngLossyCompressor(fixture, { maxQuality: 70, minQuality: 50 })

      expect(buffer.length).toBeLessThanOrEqual(fixture.length)
    }).pipe(Effect.provide(NodeServices.layer)),
  )

  it.effect('lossless compressed buffer must smaller or equal', () =>
    Effect.gen(function* () {
      const fixture = yield* loadFixture('../../fixtures/moon.png')
      const buffer = yield* pngLosslessCompressor(fixture)

      expect(buffer.length).toBeLessThanOrEqual(fixture.length)
    }).pipe(Effect.provide(NodeServices.layer)),
  )
})
