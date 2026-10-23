import type { AvifConfig, PngEncodeOptions } from '@napi-rs/image'

export type BaseServiceTransform = {
  src: string
  width?: number
  height?: number
  format?: string
  quality?: string | null
  fit?: ImageFit
}

export type ImageFit = 'cover' | 'fill' | 'inside'

export interface OximImageServiceConfig {
  png?: PngEncodeOptions
  avif?: AvifConfig
  jpeg?: { quality: number }
  webp?: { quality: number }
}
