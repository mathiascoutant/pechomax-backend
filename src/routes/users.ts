import { zValidator } from '@hono/zod-validator'
import { eq, getTableColumns } from 'drizzle-orm'
import { userRolesEnum, users } from 'src/db/schema/users'
import { HonoVar } from 'src/helpers/hono'
import { isAuth } from 'src/middlewares/isAuth'
import { z } from 'zod'

const updateUserDto = zValidator(
  'json',
  z.object({
    username: z.string().min(3).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    role: z.enum(['User', 'Admin']).optional(),
    phone_number: z.string().optional().nullable(),
    profile_pic: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    region: z.string().optional().nullable(),
    zip_code: z.string().optional().nullable(),
    score: z.number().optional(),
  })
)

const usersRoute = new HonoVar().basePath('/users')

usersRoute.get('/', async (ctx) => {
  const db = ctx.get('database')

  const userList = await db.query.users.findMany({
    columns: {
      password: false,
    },
  })

  return ctx.json(userList, 200)
})

usersRoute.get('/self', isAuth(), async (ctx) => {
  const payload = ctx.get('userPayload')
  const db = ctx.get('database')

  const user = await db.query.users.findFirst({
    columns: {
      password: false,
    },
    where: (user, { eq }) => eq(user.id, payload.id),
  })

  if (!user) {
    return ctx.json({ message: 'User not found' }, 404)
  }

  return ctx.json(user, 200)
})

usersRoute.get(
  '/:username',
  zValidator(
    'param',
    z.object({
      username: z.string(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { username } = ctx.req.valid('param')

    const user = await db.query.users.findFirst({
      columns: {
        password: false,
      },
      where: (user, { eq }) => eq(user.username, username),
    })

    if (!user) {
      return ctx.json({ message: 'User not found' }, 404)
    }

    return ctx.json(user, 200)
  }
)

usersRoute.post(
  '/create',
  isAuth('Admin'),
  zValidator(
    'json',
    z.object({
      username: z.string().min(3),
      email: z.string().email(),
      password: z.string().min(8),
      role: z.enum(userRolesEnum.enumValues),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { username, email, password, role } = ctx.req.valid('json')

    const userList = await db.insert(users).values({ username, email, password, role }).returning()

    if (userList.length === 0) {
      return ctx.json({ message: 'Internal server error' }, 500)
    }

    const user = userList[0]

    return ctx.json(user, 201)
  }
)

usersRoute.put('/update/self', isAuth(), updateUserDto, async (ctx) => {
  const payload = ctx.get('userPayload')
  const db = ctx.get('database')
  const updateDatas = ctx.req.valid('json')

  const { password, ...colWithoutPassword } = getTableColumns(users)

  const userList = await db.update(users).set(updateDatas).where(eq(users.id, payload.id)).returning(colWithoutPassword)

  if (userList.length === 0) {
    return ctx.json({ message: 'User not found' }, 404)
  }

  const user = userList[0]

  return ctx.json(user, 200)
})

usersRoute.put(
  '/update/:id',
  isAuth('Admin'),
  zValidator(
    'param',
    z.object({
      id: z.string(),
    })
  ),
  updateUserDto,
  async (ctx) => {
    const db = ctx.get('database')
    const { id } = ctx.req.valid('param')
    const updateDatas = ctx.req.valid('json')

    const { password, ...colWithoutPassword } = getTableColumns(users)

    const userList = await db.update(users).set(updateDatas).where(eq(users.id, id)).returning(colWithoutPassword)

    if (userList.length === 0) {
      return ctx.json({ message: 'User not found' }, 404)
    }

    const user = userList[0]

    return ctx.json(user, 200)
  }
)

usersRoute.delete('/delete/:id', zValidator('param', z.object({ id: z.string() })), isAuth(), async (ctx) => {
  const db = ctx.get('database')
  const { id } = ctx.req.valid('param')

  const userList = await db.delete(users).where(eq(users.id, id)).returning({
    id: users.id,
  })

  if (userList.length === 0) {
    return ctx.json({ message: 'User not found' }, 404)
  }

  const user = userList[0]

  return ctx.json(user, 200)
})

usersRoute.delete('/delete/self', isAuth(), async (ctx) => {
  const payload = ctx.get('userPayload')
  const db = ctx.get('database')

  const userList = await db.delete(users).where(eq(users.id, payload.id)).returning({
    id: users.id,
  })

  if (userList.length === 0) {
    return ctx.json({ message: 'User not found' }, 404)
  }

  const user = userList[0]

  return ctx.json(user, 200)
})

export default usersRoute
