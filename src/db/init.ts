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

export const initDb = async function () {
  const { Client } = pkg

  const client = new Client({
    connectionString: process.env.DB_URL,
  })

  await client.connect()

  return drizzle(client, {
    schema: { users, speciesLocation, species, messages, locations, levels, conversations, categories, catches },
  })
}

export type DbType = Awaited<ReturnType<typeof initDb>>
