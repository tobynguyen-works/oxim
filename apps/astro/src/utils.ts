import { DEFAULT_QUALITY } from './consts'

export const parseQualityProp = (
  input: string | null | undefined,
  fallback: number = DEFAULT_QUALITY,
) => {
  if (input == null || input.trim() === '') return fallback

  const n = Number(input)

  if (Number.isFinite(n)) {
    return Math.min(100, Math.max(0, n))
  } else {
    switch (input) {
      case 'low':
        return 25
      case 'mid':
        return 50
      case 'high':
        return 80
      case 'max':
        return 100
      default:
        return fallback
    }
  }
}
