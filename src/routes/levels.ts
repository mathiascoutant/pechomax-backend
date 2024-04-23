import { zValidator } from '@hono/zod-validator'
import { HonoVar } from 'src/helpers/hono'
import { isAuth } from 'src/middlewares/isAuth'
import { z } from 'zod'

const levelsRoute = new HonoVar().basePath('/levels').use(isAuth('Admin'))

levelsRoute.get('/', async (ctx) => {
  const db = ctx.get('database')

  const levelList = await db.query.levels.findMany()

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

export default levelsRoute
