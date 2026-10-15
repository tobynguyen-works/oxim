import { Data } from 'effect'

export class CannotCompressImageError extends Data.TaggedError('CannotCompressImageError')<{
  message: string
}> {
  constructor(message?: string) {
    super({
      message: message ?? 'Cannot compress image due to unknown error',
    })
  }
}
