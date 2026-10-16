import { StorageService } from '@oxim/storage'
import { formatBytes, hash } from '@oxim/utils'
import { Array, Duration, Effect, Option, Path, pipe, Ref } from 'effect'
import type { OutputBundle } from 'vite/rolldown'
import { compress } from './compressor'
import { getCompressorFromFileName } from './utils'
import { SUPPORTED_FORMATS } from './constants'
import { timed } from 'effect/Effect'
import { Logger } from './services/logger'
import { garbageCollector } from './gc'
import { CacheSchema, ConfigService, type Cache } from '@oxim/core'
import { decodeUnknownOption } from 'effect/Schema'
import pkg from '../package.json'

export const program = (bundles: OutputBundle) =>
  Effect.gen(function* () {
    const path = yield* Path.Path
    const storage = yield* StorageService
    const config = yield* ConfigService
    const logger = yield* Logger

    const assets = pipe(
      Object.values(bundles),
      Array.filter((it) => it.type === 'asset'),
      Array.filter((it) => SUPPORTED_FORMATS.has(path.extname(it.fileName).slice(1))),
    )

    const totalAssets = assets.length
    const counterRef = yield* Ref.make(1)
    const cacheKeysRef = yield* Ref.make<readonly string[]>([])

    const configHash = hash(JSON.stringify(config))
    const cacheDecoder = decodeUnknownOption(CacheSchema)

    yield* Effect.forEach(
      assets,
      (asset) =>
        Effect.gen(function* () {
          const oldBufferSizeBytes = yield* formatBytes((asset.source as Uint8Array).byteLength)

          const cacheKey = hash(asset.source)
          yield* Ref.update(cacheKeysRef, Array.append(cacheKey))

          const cacheRaw = yield* storage.getItem(cacheKey)
          const cache = cacheDecoder(cacheRaw)

          let buffer: Buffer<ArrayBufferLike>
          let runningTime = Duration.zero

          const validCache = cache.pipe(
            Option.filter((it) => it.configHash === configHash && it.version === pkg.version),
          )

          if (Option.isSome(validCache)) {
            buffer = Buffer.from(validCache.value.bufferHash, 'base64')
          } else {
            yield* storage.removeItem(cacheKey)

            const compressor = yield* getCompressorFromFileName(asset.fileName)
            const [duration, newBuffer] = yield* timed(
              compress(asset.source as Uint8Array, compressor),
            )
            buffer = newBuffer
            runningTime = duration

            const newCache: Cache = {
              version: pkg.version,
              configHash,
              bufferHash: buffer.toString('base64'),
            }

            yield* storage.setItem(cacheKey, JSON.stringify(newCache))
          }

          asset.source = buffer

          const currentIndex = yield* Ref.getAndUpdate(counterRef, (it) => it + 1)
          const resolveTimeMs = pipe(Duration.toMillis(runningTime), Math.round)

          const message =
            resolveTimeMs === 0
              ? '(reused cache entry)'
              : `(before: ${oldBufferSizeBytes}) (after: ${yield* formatBytes(buffer.byteLength)})`

          logger.info(
            `${asset.fileName} ${message} (${resolveTimeMs}ms) (${currentIndex}/${totalAssets})`,
          )
        }),
      { concurrency: config.concurrency },
    )

    const allCacheKeys = yield* Ref.get(cacheKeysRef)
    yield* garbageCollector(allCacheKeys)
  })
