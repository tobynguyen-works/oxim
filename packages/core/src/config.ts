import { Context } from 'effect'
import type { PngLossyCompressorOptions } from './compressors/png'
import type { JpegLossyCompressorOptions } from './compressors/jpeg'
import type { WebpLossyCompressorOptions } from './compressors/webp'
import type { AvifLossyCompressorOptions } from './compressors/avif'
import pkg from '../package.json'

export type LosslessCompressionOptions = {
  method: 'lossless'
}

export type PngLossyCompressionOptions = {
  method: 'lossy'
} & PngLossyCompressorOptions

export type JpegLossyCompressionOptions = {
  method: 'lossy'
} & JpegLossyCompressorOptions

export type WebpLossyCompressionOptions = {
  method: 'lossy'
} & WebpLossyCompressorOptions

export type AvifLossyCompressionOptions = {
  method: 'lossy'
} & AvifLossyCompressorOptions

export type PngOptions = LosslessCompressionOptions | PngLossyCompressionOptions
export type JpegOptions = LosslessCompressionOptions | JpegLossyCompressionOptions
export type WebpOptions = LosslessCompressionOptions | WebpLossyCompressionOptions
export type AvifOptions = LosslessCompressionOptions | AvifLossyCompressionOptions

export type Config = {
  concurrency: number | 'unbounded'
  png: PngOptions
  jpeg: JpegOptions
  webp: WebpOptions
  avif: AvifOptions
}

export const defaultConfig: Config = {
  concurrency: 'unbounded',
  png: {
    method: 'lossy',
    maxQuality: 80,
    minQuality: 70,
  },
  jpeg: {
    method: 'lossy',
    quality: 80,
  },
  webp: {
    method: 'lossy',
    quality: 80,
  },
  avif: {
    method: 'lossy',
    quality: 80,
  },
}

export class ConfigService extends Context.Service<ConfigService, Config>()(`${pkg.name}/Config`) {}
