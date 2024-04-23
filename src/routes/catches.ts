import { zValidator } from '@hono/zod-validator'
import { HonoVar } from 'src/helpers/hono'
import { z } from 'zod'

const catchesRoute = new HonoVar().basePath('/catches')

catchesRoute.get('/', async (ctx) => {
  const db = ctx.get('database')

  const catchList = await db.query.catches.findMany({
    with: {
      user: true,
      species: true,
    },
  })

  return ctx.json(catchList)
})

catchesRoute.get('/:id', zValidator('param', z.object({ id: z.string() })), async (ctx) => {
  const db = ctx.get('database')
  const { id } = ctx.req.valid('param')

  const catchItem = await db.query.catches.findFirst({
    where: (catchItem, { eq }) => eq(catchItem.id, id),
    with: {
      user: true,
      species: true,
    },
  })

  if (!catchItem) {
    return ctx.json({ message: 'Catch not found' }, 404)
  }

  return ctx.json(catchItem)
})

export default catchesRoute
