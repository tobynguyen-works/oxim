import { pipe } from 'effect'
import { xxh64 } from '@node-rs/xxhash'
import { serialize } from 'ohash'

export const hash = (input: any, seed?: bigint) =>
  pipe(
    input,
    serialize,
    () => xxh64(input, seed),
    (it) => it.toString(16),
  )
