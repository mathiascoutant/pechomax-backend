import 'dotenv/config'
import './src/helpers/env'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  driver: 'pg',
  out: './src/drizzle',
  schema: './src/db/schema',
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    user: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  },
  verbose: true,
  strict: true,
})
