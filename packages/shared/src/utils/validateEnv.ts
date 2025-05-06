import { z } from 'zod'

const backendSchema = z.object({
  // NestJS backend
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.string().transform(Number).pipe(z.number().int()),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DATABASE: z.string(),

  PORT: z.string().transform(Number).pipe(z.number().int()),
  MODE: z.enum(['DEV', 'PROD']),
  RUN_MIGRATIONS: z
    .string()
    .optional()
    .transform(val => val === 'true'),

  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(), // e.g., '1h'
  ENCRYPTION_KEY: z.string(),

})

const serverSchema = z.object(({
  BACKEND_API_URL: z.string().url(),
  FRONTEND_API_URL: z.string().url(),
}))

const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
})

const schema = serverSchema.merge(clientSchema)

export type ApiEnvVars = z.infer<typeof backendSchema>
export type EnvVars = z.infer<typeof schema>

let cachedEnv: EnvVars | null = null
let backendCachedEnv: EnvVars | null = null

export function getBackendEnv(): EnvVars {
  if (backendCachedEnv) return backendCachedEnv

  const parsed = schema.safeParse(process.env)

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:')
    console.table(JSON.stringify(parsed.error.format()))
    throw new Error('❌ Environment validation failed.')
  }

  backendCachedEnv = parsed.data
  return backendCachedEnv
}
export function getEnv(): EnvVars {
  if (cachedEnv) return cachedEnv

  const parsed = schema.safeParse(process.env)

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:')
    console.table(JSON.stringify(parsed.error.format()))
    throw new Error('❌ Environment validation failed.')
  }

  cachedEnv = parsed.data
  return cachedEnv
}


