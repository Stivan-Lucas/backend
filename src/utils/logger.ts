import fs from 'node:fs'
import path from 'node:path'
import type { LoggerOptions } from 'pino'
import { env } from '../env/env'

const isDev = env.NODE_ENV !== 'production'
const logsDir = path.resolve(process.cwd(), 'logs')

const ensureLogsDirectory = () => {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true })
  }
}

export const getLoggerOptions = (): LoggerOptions => {
  if (isDev) {
    return {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      },
    }
  }

  ensureLogsDirectory()

  return {
    level: env.LOG_LEVEL,
    redact: ['req.headers.authorization', 'req.headers.cookie'],
    transport: {
      targets: [
        {
          target: 'pino/file',
          level: env.LOG_LEVEL,
          options: { destination: 1 },
        },
        {
          target: 'pino-roll',
          level: env.LOG_LEVEL,
          options: {
            file: path.join(logsDir, 'server.log'),
            size: env.LOG_ROTATION_SIZE,
            interval: env.LOG_ROTATION_INTERVAL,
            limit: {
              count: env.LOG_KEEP_COUNT,
            },
            mkdir: true,
            extension: '.log',
          },
        },
      ],
    },
  }
}
