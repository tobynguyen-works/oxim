import { describe, it, expect } from '@effect/vitest'
import { Effect } from 'effect'
import { formatBytes } from '../src'

describe('pretty-bytes Effect wrappers', () => {
  it.effect('should correctly format a standard number of bytes', () =>
    Effect.gen(function* () {
      const result = yield* formatBytes(1000)
      expect(result).toBe('1 kB')
    }),
  )

  it.effect('should correctly format a bigint of bytes', () =>
    Effect.gen(function* () {
      const result = yield* formatBytes(1000000n)
      expect(result).toBe('1 MB')
    }),
  )

  it.effect('should correctly format zero bytes', () =>
    Effect.gen(function* () {
      const result = yield* formatBytes(0)
      expect(result).toBe('0 B')
    }),
  )
})
