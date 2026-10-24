import { Effect } from 'effect'
import { imageMeta } from 'image-meta'
import { FileTypeParser } from 'file-type'
import { detectXml } from '@file-type/xml'

export const getImageMeta = (input: Uint8Array) => Effect.try(() => imageMeta(input))

export const getFileTypeFromBuffer = (input: Uint8Array) =>
  Effect.gen(function* () {
    const parser = new FileTypeParser({ customDetectors: [detectXml] })

    return yield* Effect.promise(() => parser.fromBuffer(input))
  })
