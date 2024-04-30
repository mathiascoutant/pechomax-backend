import { zValidator } from '@hono/zod-validator'
import { eq, getTableColumns } from 'drizzle-orm'
import { userRolesEnum, users } from 'src/db/schema/users'
import { uploadProfile } from 'src/helpers/firebase'
import { HonoVar } from 'src/helpers/hono'
import { isAuth } from 'src/middlewares/isAuth'
import { z } from 'zod'

const usersRoute = new HonoVar().basePath('/users')

usersRoute.get('/', zValidator('query', z.object({ page: z.coerce.number().optional() })), async (ctx) => {
  const db = ctx.get('database')
  const { page = 1 } = ctx.req.valid('query')

  const userList = await db.query.users.findMany({
    columns: {
      password: false,
    },
    limit: 10,
    offset: (page - 1) * 10,
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

    const userList = await db
      .insert(users)
      .values({
        username,
        email,
        password,
        role,
        profilePic:
          'https://firebasestorage.googleapis.com/v0/b/pechomax-cfa82.appspot.com/o/profilePic%2Fdefault.png?alt=media&token=58d39852-07a3-489c-9c51-3a448ea90729',
      })
      .returning()

    if (userList.length === 0) {
      return ctx.json({ message: 'Internal server error' }, 500)
    }

    const user = userList[0]

    return ctx.json(user, 201)
  }
)

usersRoute.put(
  '/update/self',
  isAuth(),
  zValidator(
    'form',
    z.object({
      username: z.string().min(3).optional(),
      email: z.string().email().optional(),
      password: z.string().min(8).optional(),
      phoneNumber: z.string().optional().nullable(),
      profilePic: z.instanceof(File).optional().nullable(),
      city: z.string().optional().nullable(),
      region: z.string().optional().nullable(),
      zipCode: z.string().optional().nullable(),
    })
  ),
  async (ctx) => {
    const payload = ctx.get('userPayload')
    const db = ctx.get('database')
    const { profilePic, ...updateDatas } = ctx.req.valid('form')

    if (profilePic && profilePic.size > Number(process.env.MAX_FILE_SIZE)) {
      return ctx.json({ message: 'File too large' }, 400)
    }

    const profilePicUrl = profilePic ? await uploadProfile(profilePic) : undefined

    const { password, ...colWithoutPassword } = getTableColumns(users)

    const userList = await db
      .update(users)
      .set({ ...updateDatas, profilePic: profilePicUrl })
      .where(eq(users.id, payload.id))
      .returning(colWithoutPassword)

    if (userList.length === 0) {
      return ctx.json({ message: 'User not found' }, 404)
    }

    const user = userList[0]

    return ctx.json(user, 200)
  }
)

usersRoute.put(
  '/update/:id',
  isAuth('Admin'),
  zValidator(
    'param',
    z.object({
      id: z.string(),
    })
  ),
  zValidator(
    'form',
    z.object({
      username: z.string().min(3).optional(),
      email: z.string().email().optional(),
      password: z.string().min(8).optional(),
      role: z.enum(['User', 'Admin']).optional(),
      phoneNumber: z.string().optional().nullable(),
      profilePic: z.instanceof(File).optional().nullable(),
      city: z.string().optional().nullable(),
      region: z.string().optional().nullable(),
      zipCode: z.string().optional().nullable(),
      score: z.coerce.number().optional().nullable(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { id } = ctx.req.valid('param')
    const { profilePic, ...updateDatas } = ctx.req.valid('form')

    if (profilePic && profilePic.size > Number(process.env.MAX_FILE_SIZE)) {
      return ctx.json({ message: 'File too large' }, 400)
    }

    const profilePicUrl = profilePic ? await uploadProfile(profilePic) : undefined

    const { password, ...colWithoutPassword } = getTableColumns(users)

    const userList = await db
      .update(users)
      .set({ ...updateDatas, profilePic: profilePicUrl })
      .where(eq(users.id, id))
      .returning(colWithoutPassword)

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
