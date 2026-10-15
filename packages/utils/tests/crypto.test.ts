import { describe, it, expect } from '@effect/vitest'
import { Effect } from 'effect'
import { xxhash32, xxhash64 } from '../src'

describe('xxhash Effect wrappers', () => {
  describe('xxhash32', () => {
    it.effect('should successfully generate a 32-bit hash for a string input', () =>
      Effect.gen(function* () {
        const hash = yield* xxhash32('hello world')
        expect(typeof hash).toBe('number')
      }),
    )

    it.effect('should successfully generate a 32-bit hash for a Uint8Array input with a seed', () =>
      Effect.gen(function* () {
        const bytes = new TextEncoder().encode('hello world')
        const hash = yield* xxhash32(bytes, 42)
        expect(typeof hash).toBe('number')
      }),
    )
  })

  describe('xxhash64', () => {
    it.effect(
      'should successfully generate a 64-bit hash when running on a 64-bit architecture',
      () =>
        Effect.gen(function* () {
          const hash = yield* xxhash64('hello world')

          expect(hash).toBeDefined()
        }),
    )

    it.effect(
      'should successfully generate a 64-bit hash with a bigint seed on 64-bit architecture',
      () =>
        Effect.gen(function* () {
          const hash = yield* xxhash64('hello world', 123n)

          expect(hash).toBeDefined()
        }),
    )
  })
})
