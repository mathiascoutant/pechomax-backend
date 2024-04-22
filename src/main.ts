import { showRoutes } from 'hono/dev'
import { serve } from '@hono/node-server'
import './helpers/env'
import { db } from './db/init'
import authRoute from './routes/auth'
import { cors } from 'hono/cors'
import usersRoute from './routes/users'
import categoriesRoute from './routes/categories'
import conversationsRoute from './routes/conversations'
import messagesRoute from './routes/messages'
import { HonoVar } from './helpers/hono'
import { env } from 'hono/adapter'

if (process?.env?.NODE_ENV === 'DEV') {
  const { migrate } = await import('drizzle-orm/node-postgres/migrator')

  await migrate(db, { migrationsFolder: 'migrations/' })
}

const app = new HonoVar()

app.use(async (ctx, next) => {
  ctx.set('database', db)
  await next()
})

app.use(
  cors({
    origin: (_, ctx) => env(ctx)['ORIGIN'],
    credentials: true,
  })
)

app.route('/', authRoute)
app.route('/', usersRoute)
app.route('/', categoriesRoute)
app.route('/', conversationsRoute)
app.route('/', messagesRoute)

showRoutes(app)

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => console.log(`Listening on http://localhost:${info.port}`)
)
