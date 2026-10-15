import type { Plugin } from 'vite-plus'
import pkg from '../package.json'
import { Duration, Effect, Layer, pipe } from 'effect'
import { NodeServices } from '@effect/platform-node'
import { convertMillisecondsToSeconds } from './utils'
import { sync, tap, timed } from 'effect/Effect'
import pc from 'picocolors'
import { createLogger, Logger } from './services/logger'
import { program } from './program'
import { createStorageService, StorageService } from '@oxim/storage'
import { CACHE_FOLDER } from './constants'
import { ConfigService, defaultConfig, type Config } from '@oxim/core'

export default function Oxim(opts: Partial<Config> = {}): Plugin {
  const options = { ...defaultConfig, ...opts } satisfies Config

  const ConfigLive = Layer.succeed(ConfigService, options)
  const StorageLive = Layer.effect(StorageService, createStorageService(CACHE_FOLDER))

  return {
    name: pkg.name,
    async generateBundle(_, bundles) {
      const LoggerLive = Layer.succeed(Logger, createLogger(this))

      const appLayer = NodeServices.layer.pipe(
        Layer.provideMerge(ConfigLive),
        Layer.provideMerge(LoggerLive),
        Layer.provideMerge(StorageLive),
      )

      const app = pipe(
        program(bundles),
        Effect.provide(appLayer),
        timed,
        tap(([duration]) =>
          sync(() => {
            pipe(
              `Completed in ${pipe(duration, Duration.toMillis, convertMillisecondsToSeconds)}s.`,
              pc.green,
              this.info,
            )
          }),
        ),
      )

      pipe(' generating optimized images ', pc.bgGreen, pc.black, this.info)

      await Effect.runPromise(app)
    },
  }
}
