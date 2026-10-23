import type { ImageOutputFormat, LocalImageService } from 'astro'
import { baseService } from 'astro/assets'
import type { BaseServiceTransform, OximImageServiceConfig } from './types'
import { AstroError, AstroErrorData } from 'astro/errors'
import { FastResizeFilter, ResizeFit, Transformer } from '@napi-rs/image'
import { Effect } from 'effect'
import { getImageMeta } from '@oxim/utils'

export const OximImageService: LocalImageService<OximImageServiceConfig> = {
  ...baseService,
  async transform(inputBuffer, transformOptions, config, logger) {
    const transform = transformOptions as BaseServiceTransform

    const imageMeta = Effect.runSync(
      Effect.match(getImageMeta(inputBuffer), {
        onSuccess: (it) => it,
        onFailure: () => null,
      }),
    )

    // FIXME: imageMeta also fails if the SVG has percentage size
    if (!imageMeta) {
      throw new AstroError(AstroErrorData.NoImageMetadata.message(transform.src))
    }

    const { type: bufferFormat, ...bufferMeta } = imageMeta
    const outputFormat = transform.format ?? (bufferFormat === 'svg' ? 'svg' : 'webp')

    // Handle SVG here
    if (outputFormat === 'svg') {
      if (bufferFormat && bufferFormat !== 'svg') {
        logger.warn(
          `Astro expected an SVG for "${transform.src}" but the source is ${bufferFormat}. Passing it through as ${bufferFormat} instead.`,
        )
        return { data: inputBuffer, format: bufferFormat as ImageOutputFormat }
      }

      // Add an optimizer here
      return { data: inputBuffer, format: 'svg' }
    }

    // non-SVG here
    if (bufferFormat === 'svg' && !config.dangerouslyProcessSVG) {
      throw new AstroError(
        `SVG image processing is disabled, but the source for "${transform.src}" is an SVG. Pass it through unchanged by setting \`format="svg"\` on the component, or set \`image.dangerouslyProcessSVG: true\` to rasterize SVG sources.`,
      )
    }

    let tx

    if (bufferFormat === 'svg') {
      tx = Transformer.fromSvg(inputBuffer)
    } else {
      tx = new Transformer(inputBuffer)
    }

    tx.rotate()

    if (transform.width && transform.height) {
      let fitType: ResizeFit

      switch (transform.fit) {
        case 'cover':
          fitType = ResizeFit.Cover
          break
        case 'fill':
          fitType = ResizeFit.Fill
          break
        default:
          fitType = ResizeFit.Inside
          break
      }

      tx.fastResize({
        width: Math.round(transform.width),
        height: Math.round(transform.height),
        fit: fitType,
        filter: FastResizeFilter.Lanczos3,
      })
    } else if (transform.height && !transform.width) {
      const width = Math.round(transform.height * (bufferMeta.width / bufferMeta.height))

      tx.fastResize({
        width,
        height: Math.round(transform.height),
        filter: FastResizeFilter.Lanczos3,
      })
    } else if (transform.width) {
      tx.fastResize({
        width: Math.round(transform.width),
        filter: FastResizeFilter.Lanczos3,
      })
    }

    let buffer

    switch (outputFormat) {
      case 'png':
        buffer = await tx.png(config.service.config.png)
        break
      case 'avif':
        buffer = await tx.avif(config.service.config.avif)
        break
      case 'jpeg':
      case 'jpg':
        buffer = await tx.jpeg(config.service.config.jpeg?.quality)
        break
      case 'webp':
        buffer = await tx.webp(config.service.config.webp?.quality)
        break
      default:
        buffer = inputBuffer
        break
    }

    return {
      data: buffer,
      format: outputFormat,
    }
  },
}

export default OximImageService
