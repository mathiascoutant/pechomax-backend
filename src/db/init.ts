import { drizzle } from 'drizzle-orm/node-postgres'
import pkg from 'pg'
import * as users from './schema/users'
import * as speciesLocation from './schema/speciesLocation'
import * as species from './schema/species'
import * as messages from './schema/messages'
import * as locations from './schema/locations'
import * as levels from './schema/levels'
import * as conversations from './schema/conversations'
import * as categories from './schema/categories'
import * as catches from './schema/catches'
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
  schema: {
    ...users,
    ...speciesLocation,
    ...species,
    ...messages,
    ...locations,
    ...levels,
    ...conversations,
    ...categories,
    ...catches,
  },
})

export type DbType = typeof db
