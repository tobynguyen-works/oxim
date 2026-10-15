import { Transformer } from '@napi-rs/image'
import { tryPromise } from 'effect/Effect'
import { CannotCompressImageError } from '../errors'

export type WebpLossyCompressorOptions = {
  quality?: number
}

export const webpLosslessCompressor = (buffer: Uint8Array<ArrayBufferLike>) =>
  tryPromise({
    try: () => new Transformer(buffer).webpLossless(),
    catch: (unknown) =>
      new CannotCompressImageError(unknown instanceof Error ? unknown.message : undefined),
  })

export const webpLossyCompressor = (
  buffer: Uint8Array<ArrayBufferLike>,
  options: WebpLossyCompressorOptions,
) =>
  tryPromise({
    try: () => new Transformer(buffer).webp(options.quality),
    catch: (unknown) =>
      new CannotCompressImageError(unknown instanceof Error ? unknown.message : undefined),
  })
