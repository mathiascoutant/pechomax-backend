import { zValidator } from '@hono/zod-validator'
import { deleteCookie, setSignedCookie } from 'hono/cookie'
import { compare, genSalt, hash } from 'bcrypt'
import { users } from 'src/db/schema/users'
import { HonoVar } from 'src/helpers/hono'
import { z } from 'zod'
import { Payload } from 'src/types/payload'
import { sign } from 'hono/jwt'
import { isAuth } from 'src/middlewares/isAuth'

const authRoute = new HonoVar().basePath('/auth')

authRoute.post(
  '/init',
  zValidator(
    'json',
    z.object({
      username: z.string().min(3),
      email: z.string().email(),
      password: z.string().min(8),
    })
  ),
  async (ctx) => {
    const { username, email, password } = ctx.req.valid('json')
    const db = ctx.get('database')

    const adminList = await db.query.users.findMany({
      columns: { id: true },
      where: (user, { eq }) => eq(user.role, 'Admin'),
    })

    if (adminList.length > 0) {
      return ctx.json({ message: 'Admin already exists' }, 400)
    }

    const salt = await genSalt()
    const hashedPassword = await hash(password, salt)

    const userList = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        role: 'Admin',
      })
      .returning()

    if (userList.length > 0) {
      const { password, ...user } = userList[0]

      return ctx.json(user, 201)
    }

    return ctx.json({ message: 'Failed to register' }, 500)
  }
)

authRoute.post(
  '/register',
  zValidator(
    'json',
    z.object({
      username: z.string().min(3),
      email: z.string().email(),
      password: z.string().min(8),
    })
  ),
  async (ctx) => {
    const { username, email, password } = ctx.req.valid('json')
    const db = ctx.get('database')

    const salt = await genSalt()
    const hashedPassword = await hash(password, salt)

    const userList = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
      })
      .returning()

    if (userList.length > 0) {
      const { password, ...user } = userList[0]

      const payload: Payload = {
        id: user[0].id,
        username: user[0].username,
        role: user[0].role,
      }

      const token = await sign(payload, process.env.JWT_SECRET)

      await setSignedCookie(ctx, 'access_token', token, process.env.COOKIE_SECRET)

      ctx.json(payload, 201)
    }

    ctx.json({ message: 'Failed to register' }, 500)
  }
)

authRoute.post(
  '/login',
  zValidator(
    'json',
    z.object({
      username: z.string().optional(),
      email: z.string().email().optional(),
      password: z.string().email(),
    })
  ),
  async (ctx) => {
    const { username, email, password } = ctx.req.valid('json')
    const db = ctx.get('database')

    const user = await db.query.users.findFirst({
      where: (user, { eq, or }) => or(eq(user.username, username), eq(user.email, email)),
    })

    const isMatch = compare(password, user.password)

    if (isMatch) {
      const payload: Payload = {
        id: user.id,
        username: user.username,
        role: user.role,
      }

      const token = await sign(payload, process.env.JWT_SECRET)

      await setSignedCookie(ctx, 'access_token', token, process.env.COOKIE_SECRET)

      ctx.json(payload, 200)
    }

    ctx.json({ message: 'Wrong password' }, 401)
  }
)

authRoute.get('/login', isAuth(), async (ctx) => {
  const payload = ctx.get('userPayload')
  ctx.json(payload, 200)
})

authRoute.get('/logout', isAuth(), async (ctx) => {
  deleteCookie(ctx, 'access_token', { path: '/auth' })
  ctx.text('Logged out', 200)
})

export default authRoute
