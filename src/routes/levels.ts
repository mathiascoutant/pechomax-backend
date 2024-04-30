import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { levels } from 'src/db/schema/levels'
import { HonoVar } from 'src/helpers/hono'
import { isAuth } from 'src/middlewares/isAuth'
import { z } from 'zod'

const levelsRoute = new HonoVar().basePath('/levels').use(isAuth('Admin'))

levelsRoute.get('/', zValidator('query', z.object({ page: z.number().optional() })), async (ctx) => {
  const db = ctx.get('database')
  const { page = 1 } = ctx.req.valid('query')

  const pageSize = Number(process.env.PAGE_SIZE)

  const levelList = await db.query.levels.findMany({ limit: pageSize, offset: (page - 1) * pageSize })

  return ctx.json(levelList, 200)
})

levelsRoute.get('/:id', zValidator('param', z.object({ id: z.string() })), async (ctx) => {
  const db = ctx.get('database')
  const { id } = ctx.req.valid('param')

  const level = await db.query.levels.findFirst({
    where: (level, { eq }) => eq(level.id, id),
  })

  if (!level) {
    return ctx.json({ message: 'Level not found' }, 404)
  }

  return ctx.json(level, 200)
})

levelsRoute.post(
  '/create',
  zValidator(
    'json',
    z.object({
      title: z.string(),
      value: z.number(),
      start: z.number(),
      end: z.number(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { title, value, start, end } = ctx.req.valid('json')

    const levelList = await db
      .insert(levels)
      .values({
        title,
        value,
        start,
        end,
      })
      .returning()

    if (levelList.length === 0) {
      return ctx.json({ message: 'Failed to create level' }, 500)
    }

    return ctx.json(levelList[0], 201)
  }
)

levelsRoute.put(
  '/update/:id',
  zValidator('param', z.object({ id: z.string() })),
  zValidator(
    'json',
    z.object({
      title: z.string().optional(),
      value: z.number().optional(),
      start: z.number().optional(),
      end: z.number().optional(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { id } = ctx.req.valid('param')
    const updateDatas = ctx.req.valid('json')

    const levelList = await db.update(levels).set(updateDatas).where(eq(levels.id, id)).returning()

    if (levelList.length === 0) {
      return ctx.json({ message: 'Failed to update level' }, 500)
    }

    return ctx.json(levelList[0], 200)
  }
)

levelsRoute.delete('/delete/:id', zValidator('param', z.object({ id: z.string() })), async (ctx) => {
  const db = ctx.get('database')
  const { id } = ctx.req.valid('param')

  const levelList = await db.delete(levels).where(eq(levels.id, id)).returning({ id: levels.id })

  if (levelList.length === 0) {
    return ctx.json({ message: 'Failed to delete level' }, 500)
  }

  return ctx.json(levelList[0], 200)
})

export default levelsRoute
