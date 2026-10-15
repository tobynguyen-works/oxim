import { Effect, Path } from 'effect'
import type { Compressor } from './compressor'

const extensionMap: Record<string, Compressor> = {
  '.png': 'png',
  '.webp': 'webp',
  '.avif': 'avif',
}

export const getCompressorFromFileName = (
  filename: string,
): Effect.Effect<Compressor, never, Path.Path> =>
  Effect.gen(function* () {
    const path = yield* Path.Path
    const ext = path.extname(filename).toLowerCase()

    return extensionMap[ext] ?? 'jpeg'
  })

export const convertMillisecondsToSeconds = (ms: number, fixed: number = 2) =>
  (ms / 1000).toFixed(fixed)
