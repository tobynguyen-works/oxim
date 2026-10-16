import { describe, it, expect } from '@effect/vitest'
import { hash } from '../src'
describe('xxhash64', () => {
  it('should successfully generate a hash', () => {
    const result = hash('hello world')

    expect(result).toBeDefined()
  })

  it('should successfully generate a hash with a bigint seed', () => {
    const result = hash('hello world', 123n)

    expect(result).toBeDefined()
  })
})
