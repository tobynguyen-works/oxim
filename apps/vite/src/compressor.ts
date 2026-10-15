import { Effect } from 'effect'
import {
  avifLosslessCompressor,
  avifLossyCompressor,
  ConfigService,
  jpegLosslessCompressor,
  jpegLossyCompressor,
  pngLosslessCompressor,
  pngLossyCompressor,
  webpLosslessCompressor,
  webpLossyCompressor,
} from '@oxim/core'

export type Compressor = 'png' | 'jpeg' | 'avif' | 'webp'

const compressors = {
  png: { lossless: pngLosslessCompressor, lossy: pngLossyCompressor },
  jpeg: { lossless: jpegLosslessCompressor, lossy: jpegLossyCompressor },
  avif: { lossless: avifLosslessCompressor, lossy: avifLossyCompressor },
  webp: { lossless: webpLosslessCompressor, lossy: webpLossyCompressor },
}

export const compress = (input: Uint8Array<ArrayBufferLike>, compressor: Compressor) =>
  Effect.gen(function* () {
    const config = (yield* ConfigService)[compressor]
    const { lossless, lossy } = compressors[compressor]

    return config.method === 'lossless' ? yield* lossless(input) : yield* lossy(input, config)
  })
