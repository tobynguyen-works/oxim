import { losslessCompressPng, pngQuantize, type PngQuantOptions } from '@napi-rs/image'
import { tryPromise } from 'effect/Effect'
import { CannotCompressImageError } from '../errors'

export type PngLossyCompressorOptions = Pick<PngQuantOptions, 'minQuality' | 'maxQuality'>

export const pngLosslessCompressor = (buffer: Uint8Array<ArrayBufferLike>) =>
  tryPromise({
    try: () => losslessCompressPng(buffer, { strip: true }),
    catch: (unknown) =>
      new CannotCompressImageError(unknown instanceof Error ? unknown.message : undefined),
  })

export const pngLossyCompressor = (
  buffer: Uint8Array<ArrayBufferLike>,
  options?: PngLossyCompressorOptions,
) =>
  tryPromise({
    try: () => pngQuantize(buffer, options),
    catch: (unknown) =>
      new CannotCompressImageError(unknown instanceof Error ? unknown.message : undefined),
  })
