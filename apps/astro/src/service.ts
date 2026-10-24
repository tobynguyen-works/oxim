import type { ImageOutputFormat, LocalImageService } from 'astro'
import { baseService } from 'astro/assets'
import type { BaseServiceTransform, OximImageServiceConfig } from './types'
import { AstroError, AstroErrorData } from 'astro/errors'
import { FastResizeFilter, ResizeFit, Transformer } from '@napi-rs/image'
import { Effect } from 'effect'
import { getFileTypeFromBuffer } from '@oxim/utils'
import { DEFAULT_OUTPUT_FORMAT } from './consts'

export const OximImageService: LocalImageService<OximImageServiceConfig> = {
  ...baseService,
  async transform(inputBuffer, transformOptions, config, logger) {
    const transform = transformOptions as BaseServiceTransform

    const imageMeta = await Effect.runPromise(
      Effect.match(getFileTypeFromBuffer(inputBuffer), {
        onSuccess: (it) => it,
        onFailure: () => null,
      }),
    )

    // What if an svg has percentage size?
    if (!imageMeta) {
      throw new AstroError(AstroErrorData.NoImageMetadata.message(transform.src))
    }

    const { ext: bufferFormat } = imageMeta
    const outputFormat =
      transform.format ??
      (bufferFormat === 'svg'
        ? 'svg'
        : bufferFormat === 'gif'
          ? 'gif'
          : bufferFormat === 'apng'
            ? 'apng'
            : DEFAULT_OUTPUT_FORMAT)

    // Handle unsupported output format
    if (outputFormat === 'svg' || outputFormat === 'gif' || outputFormat === 'apng') {
      if (bufferFormat === 'svg' && outputFormat === 'svg') {
        return { data: inputBuffer, format: bufferFormat as ImageOutputFormat }
      }

      if (bufferFormat === 'gif' && outputFormat === 'gif') {
        return { data: inputBuffer, format: bufferFormat as ImageOutputFormat }
      }

      if (bufferFormat === 'apng' && outputFormat === 'apng') {
        return { data: inputBuffer, format: bufferFormat as ImageOutputFormat }
      }

      logger.warn(
        `Astro expected an ${outputFormat.toUpperCase()} for "${transform.src}" but the source is ${bufferFormat}. Passing it through as ${bufferFormat} instead.`,
      )
      return { data: inputBuffer, format: bufferFormat as ImageOutputFormat }
    }

    // Handle unsupported input format
    if (bufferFormat === 'gif' || bufferFormat === 'apng') {
      logger.warn(`We does not support processing ${bufferFormat.toUpperCase()}`)
      return { data: inputBuffer, format: bufferFormat as ImageOutputFormat }
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
      const { width: w, height: h } = await tx.metadata()
      const width = Math.round(transform.height * (w / h))

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

    const quality = transform.quality == null ? transform.quality : Number(transform.quality)
    let buffer

    switch (outputFormat) {
      case 'png':
        buffer = await tx.png(config.service.config.png)
        break
      case 'avif':
        buffer = await tx.avif(
          quality
            ? { ...config.service.config.avif, quality: quality }
            : config.service.config.avif,
        )
        break
      case 'jpeg':
      case 'jpg':
        buffer = await tx.jpeg(quality ?? config.service.config.jpeg?.quality)
        break
      case 'webp':
        buffer = await tx.webp(quality ?? config.service.config.webp?.quality)
        break
      case 'tiff':
      case 'tif':
        buffer = await tx.tiff()
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
