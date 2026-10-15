import { FileSystem, Path } from 'effect'
import { gen } from 'effect/Effect'

export const loadFixture = (filePath: string) =>
  gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    return yield* fs.readFile(path.join(import.meta.dirname, filePath))
  })
