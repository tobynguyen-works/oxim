import { Transformer } from '@napi-rs/image'
import { tryPromise } from 'effect/Effect'
import { CannotCompressImageError } from '../errors'

export type AvifLossyCompressorOptions = {
  quality?: number
  alphaQuality?: number
}

export const avifLosslessCompressor = (buffer: Uint8Array<ArrayBufferLike>) =>
  tryPromise({
    try: () => new Transformer(buffer).avif({ quality: 100, alphaQuality: 100 }),
    catch: (unknown) =>
      new CannotCompressImageError(unknown instanceof Error ? unknown.message : undefined),
  })

export const avifLossyCompressor = (
  buffer: Uint8Array<ArrayBufferLike>,
  options: AvifLossyCompressorOptions,
) =>
  tryPromise({
    try: () => new Transformer(buffer).avif({ ...options }),
    catch: (unknown) =>
      new CannotCompressImageError(unknown instanceof Error ? unknown.message : undefined),
  })
