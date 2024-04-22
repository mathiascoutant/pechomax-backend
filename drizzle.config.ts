import 'dotenv/config'
import './src/helpers/env'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  driver: 'pg',
  out: './migrations',
  schema: './src/db/schema',
  dbCredentials: {
    connectionString: process.env.DB_URL,
  },
  verbose: true,
  strict: true,
})
