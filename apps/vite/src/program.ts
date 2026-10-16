import { StorageService } from '@oxim/storage'
import { formatBytes, hash } from '@oxim/utils'
import { Duration, Effect, Path, pipe, Ref, Result } from 'effect'
import type { OutputBundle } from 'vite/rolldown'
import { compress } from './compressor'
import { getCompressorFromFileName } from './utils'
import { SUPPORTED_FORMATS } from './constants'
import { timed } from 'effect/Effect'
import { Logger } from './services/logger'
import { garbageCollector } from './gc'
import { CacheSchema, ConfigService, type Cache } from '@oxim/core'
import { decodeUnknownResult } from 'effect/Schema'
import pkg from '../package.json'

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

          const cacheKey = hash(asset.source)
          yield* Ref.update(cacheKeysRef, (it) => [...it, cacheKey])

          const cacheRaw = yield* storage.getItem(cacheKey)
          const cache = decodeUnknownResult(CacheSchema)(cacheRaw)

          let buffer: Buffer<ArrayBufferLike>

          if (
            cacheRaw &&
            Result.isSuccess(cache) &&
            cache.success.configHash === hash(JSON.stringify(config)) &&
            cache.success.version === pkg.version
          ) {
            buffer = Buffer.from(cache.success.bufferHash, 'base64')
          } else {
            if (cacheRaw && Result.isFailure(cache)) {
              yield* storage.removeItem(cacheKey)
            }

            const compressor = yield* getCompressorFromFileName(asset.fileName)
            const [duration, newBuffer] = yield* timed(
              compress(asset.source as Uint8Array, compressor),
            )
            buffer = newBuffer
            runningTime = duration

            const newCache: Cache = {
              version: pkg.version,
              configHash: hash(JSON.stringify(config)),
              bufferHash: buffer.toString('base64'),
            }

            yield* storage.setItem(cacheKey, JSON.stringify(newCache))
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
