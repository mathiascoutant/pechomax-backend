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
  FIREBASE_API_KEY: z.string(),
  FIREBASE_AUTH_DOMAIN: z.string(),
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_STORAGE_BUCKET: z.string(),
  FIREBASE_MESSAGING_SENDER_ID: z.string(),
  FIREBASE_APP_ID: z.string(),
  FIREBASE_MEASUREMENT_ID: z.string(),
  PAGE_SIZE: z.string().default('15'),
  MAX_FILE_SIZE: z.string().default((10 * 1024 * 1024).toString()),
  NODE_ENV: z.enum(['DEV', 'PROD']),
})

const parsedEnv = envSchema.parse(process.env)

process.env = parsedEnv

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
