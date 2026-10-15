import { StorageService } from '@oxim/storage'
import { formatBytes, xxhash64 } from '@oxim/utils'
import { Duration, Effect, Path, pipe, Ref } from 'effect'
import type { OutputBundle } from 'vite/rolldown'
import { compress } from './compressor'
import { getCompressorFromFileName } from './utils'
import { SUPPORTED_FORMATS } from './constants'
import { timed } from 'effect/Effect'
import { Logger } from './services/logger'
import { garbageCollector } from './gc'
import { ConfigService } from '@oxim/core'

export const program = (bundles: OutputBundle) =>
  Effect.gen(function* () {
    const path = yield* Path.Path
    const storage = yield* StorageService
    const config = yield* ConfigService
    const logger = yield* Logger

    const assets = pipe(
      bundles,
      (it) => Object.values(it),
      (chunks) => chunks.filter((it) => it.type === 'asset'),
      (chunks) => chunks.filter((it) => SUPPORTED_FORMATS.has(path.extname(it.fileName).slice(1))),
    )

    const totalAssets = assets.length
    const counterRef = yield* Ref.make(1)
    const cacheKeysRef = yield* Ref.make<string[]>([])

    yield* Effect.forEach(
      assets,
      (asset) =>
        Effect.gen(function* () {
          let runningTime = Duration.zero
          const oldBufferSizeBytes = yield* formatBytes((asset.source as Uint8Array).byteLength)

          const cacheKey = yield* pipe(
            xxhash64(asset.source),
            Effect.map((it) => it.toString(16)),
          )
          yield* Ref.update(cacheKeysRef, (it) => [...it, cacheKey])

          const cacheValue = yield* storage.getItem(cacheKey)

          let buffer: Buffer<ArrayBufferLike>

          if (cacheValue) {
            buffer = Buffer.from(cacheValue, 'base64')
          } else {
            const compressor = yield* getCompressorFromFileName(asset.fileName)
            const [duration, newBuffer] = yield* timed(
              compress(asset.source as Uint8Array, compressor),
            )
            buffer = newBuffer
            runningTime = duration

            yield* storage.setItem(cacheKey, buffer.toString('base64'))
          }

          asset.source = buffer

          const currentIndex = yield* Ref.getAndUpdate(counterRef, (it) => it + 1)
          const resolveTimeMs = pipe(Duration.toMillis(runningTime), Math.round)

          let message: string
          if (resolveTimeMs === 0) {
            message = '(reused cache entry)'
          } else {
            const newBufferSizeBytes = yield* formatBytes(buffer.byteLength)
            message = `(before: ${oldBufferSizeBytes}) (after: ${newBufferSizeBytes})`
          }

          logger.info(
            `${asset.fileName} ${message} (${resolveTimeMs}ms) (${currentIndex}/${totalAssets})`,
          )
        }),
      { concurrency: config.concurrency },
    )

    const allCacheKeys = yield* Ref.get(cacheKeysRef)
    yield* garbageCollector(allCacheKeys)
  })
