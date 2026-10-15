import { Effect } from 'effect'
import { xxh32, xxh64 } from '@node-rs/xxhash'

export const xxhash32 = (input: Uint8Array | string, seed?: number) =>
  Effect.sync(() => xxh32(input, seed))

export const xxhash64 = (input: Uint8Array | string, seed?: bigint) =>
  Effect.sync(() => xxh64(input, seed))
