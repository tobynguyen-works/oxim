import { Effect } from 'effect'
import { imageMeta } from 'image-meta'

export const getImageMeta = (input: Uint8Array) => Effect.sync(() => imageMeta(input))
