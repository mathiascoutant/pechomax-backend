import { z } from 'zod'

const envSchema = z.object({
  DB_URL: z.string(),
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
