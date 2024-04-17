import { Hono } from 'hono'
import { showRoutes } from 'hono/dev'
import { serve } from '@hono/node-server'
import './helpers/env'
import { db } from './db/init'
import authRoute from './routes/auth'
import { cors } from 'hono/cors'
import usersRoute from './routes/users'
import categoriesRoute from './routes/categories'

if (process.env.NODE_ENV === 'DEV') {
  const { migrate } = await import('drizzle-orm/node-postgres/migrator')

  await migrate(db, { migrationsFolder: 'migrations/' })
}

const app = new Hono()

app.use(async (ctx, next) => {
  ctx.set('database', db)
  await next()
})

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
)

app.route('/', authRoute)
app.route('/', usersRoute)
app.route('/', categoriesRoute)

showRoutes(app)

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => console.log(`Listening on http://localhost:${info.port}`)
)
