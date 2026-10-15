import { Effect } from 'effect'
import prettyBytes from 'pretty-bytes'

export const formatBytes = (input: number | bigint) => Effect.sync(() => prettyBytes(input))
