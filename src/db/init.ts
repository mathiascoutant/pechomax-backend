import { drizzle } from 'drizzle-orm/node-postgres'
import pkg from 'pg'
import { users } from './schema/users'
import { speciesLocation } from './schema/speciesLocation'
import { species } from './schema/species'
import { messages } from './schema/messages'
import { locations } from './schema/locations'
import { levels } from './schema/levels'
import { conversations } from './schema/conversations'
import { categories } from './schema/categories'
import { catches } from './schema/catches'
const { Client } = pkg

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
})

await client.connect()
export const db = drizzle(client, {
  schema: { users, speciesLocation, species, messages, locations, levels, conversations, categories, catches },
})

export type DbType = typeof db
