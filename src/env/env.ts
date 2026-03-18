import z from 'zod'

const sizeRegex = /^\d+(k|m|g)$/i
const intervalRegex = /^\d+(s|m|h|d)$/i

const envSchema = z.object({
  // Server Config
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().int().positive(),
  HOST: z.string(),

  // LOGS Config
  LOG_LEVEL: z.enum([
    'trace',
    'debug',
    'info',
    'notice',
    'warn',
    'error',
    'critical',
    'alert',
    'emergency',
    'fatal',
    'all',
    'off',
  ]),
  LOG_ROTATION_SIZE: z
    .string()
    .regex(sizeRegex, 'Invalid size format (ex: 100m, 1g)'),
  LOG_ROTATION_INTERVAL: z
    .string()
    .regex(intervalRegex, 'Invalid interval format (ex: 1d, 12h)'),
  LOG_KEEP_COUNT: z.coerce.number().int().positive(),

  // CORS Config
  CORS_ORIGIN: z.string(),
  CORS_METHODS: z
    .string()
    .transform((val) => val.split(',').map((v) => v.trim().toUpperCase())),
  CORS_ALLOWED_HEADERS: z
    .string()
    .transform((val) => val.split(',').map((v) => v.trim())),
})

const _env = envSchema.safeParse(Bun.env)

if (!_env.success) {
  console.error('❌ Invalid environment variables:')
  const tree = z.treeifyError(_env.error)
  console.error(tree)
  process.exit(1)
}

export const env = _env.data
