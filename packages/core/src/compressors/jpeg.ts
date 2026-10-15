import { compressJpeg } from '@napi-rs/image'
import { tryPromise } from 'effect/Effect'
import { CannotCompressImageError } from '../errors'

export type JpegLossyCompressorOptions = {
  quality?: number
}

const jpegCompressor = (buffer: Uint8Array<ArrayBufferLike>, quality?: number) =>
  tryPromise({
    try: () => compressJpeg(buffer, { quality }),
    catch: (unknown) =>
      new CannotCompressImageError(unknown instanceof Error ? unknown.message : undefined),
  })

export const jpegLosslessCompressor = (buffer: Uint8Array<ArrayBufferLike>) =>
  jpegCompressor(buffer, 100)

export const jpegLossyCompressor = (
  buffer: Uint8Array<ArrayBufferLike>,
  options: JpegLossyCompressorOptions,
) => jpegCompressor(buffer, options.quality)
