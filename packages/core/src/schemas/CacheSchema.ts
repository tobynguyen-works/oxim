import { Schema } from 'effect'

export const CacheSchema = Schema.Struct({
  version: Schema.String,
  configHash: Schema.String,
  bufferHash: Schema.String,
})

export type Cache = typeof CacheSchema.Type
