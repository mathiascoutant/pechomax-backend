import './helpers/env'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import pkg from 'pg'
const { Client } = pkg

const client = new Client({
  connectionString: process.env.DB_URL,
})

await client.connect()
const db = drizzle(client)

await migrate(db, { migrationsFolder: 'migrations/' })

process.exit(0)
