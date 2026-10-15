import { Context } from 'effect'
import pkg from '../../package.json'
import type { PluginContext } from 'vite/rolldown'

interface LoggerService {
  info: (msg: string) => void
  warn: (msg: string) => void
  error: (msg: string) => void
}

export class Logger extends Context.Service<Logger, LoggerService>()(`${pkg.name}/Logger`) {}

export const createLogger = ({ info, warn, error }: PluginContext): LoggerService => ({
  info,
  warn,
  error,
})
