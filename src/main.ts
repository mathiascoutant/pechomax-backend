// import './helpers/env'
import authRoute from './routes/auth'
// import { cors } from 'hono/cors'
import usersRoute from './routes/users'
import categoriesRoute from './routes/categories'
import conversationsRoute from './routes/conversations'
import { drizzle } from 'drizzle-orm/node-postgres'
import { users } from './db/schema/users'
import { speciesLocation } from './db/schema/speciesLocation'
import { species } from './db/schema/species'
import { messages } from './db/schema/messages'
import { locations } from './db/schema/locations'
import { levels } from './db/schema/levels'
import { conversations } from './db/schema/conversations'
import { categories } from './db/schema/categories'
import { catches } from './db/schema/catches'
import { env } from 'hono/adapter'
import { HonoVar } from './helpers/hono'

const app = new HonoVar()

app.use(async (ctx, next) => {
  try {
    const { Pool } = await import('pg')

    const { DB_URL } = env(ctx)

    const client = new Pool({
      connectionString: DB_URL,
      ssl: true,
    })

    // await client.connect().catch((err) => {
    //   msg = err.message
    // })

    const db = drizzle(client, {
      schema: { users, speciesLocation, species, messages, locations, levels, conversations, categories, catches },
    })

    // return ctx.json(db)
    // return ctx.json(db)

    ctx.set('database', db)

    await next()
  } catch (err) {
    return ctx.json({ error: err }, 400)
  }
})

// app.use(
//   '*',
//   cors({
//     origin: (_origin, ctx) => env(ctx)['ORIGIN'],
//   })
// )

app.get('/', async (ctx) => ctx.text('Hello World'))

app.route('/', authRoute)
app.route('/', usersRoute)
app.route('/', categoriesRoute)
app.route('/', conversationsRoute)

// showRoutes(app)

// serve(
//   {
//     fetch: app.fetch,
//     port: 3000,
//   },
//   (info) => console.log(`Listening on http://localhost:${info.port}`)
// )

export default app
