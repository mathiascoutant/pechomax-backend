import { z } from 'zod'

const envSchema = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  COOKIE_SECRET: z.string(),
  JWT_SECRET: z.string(),
  CORS_ORIGIN: z.string(),
  NODE_ENV: z.enum(['DEV', 'PROD']),
})

envSchema.parse(process.env)

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
