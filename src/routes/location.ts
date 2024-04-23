import { zValidator } from '@hono/zod-validator'
import { HonoVar } from 'src/helpers/hono'
import { z } from 'zod'

const locationsRoute = new HonoVar().basePath('locations')

locationsRoute.get('/', async (ctx) => {
  const db = ctx.get('database')

  const locations = await db.query.locations.findMany()

  return ctx.json(locations)
})

locationsRoute.get(
  '/:id',
  zValidator(
    'param',
    z.object({
      id: z.string(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { id } = ctx.req.valid('param')

    const location = await db.query.locations.findFirst({
      where: (location, { eq }) => eq(location.id, id),
    })

    if (!location) {
      return ctx.json({ message: 'Location not found' }, 404)
    }

    return ctx.json(location)
  }
)

export default locationsRoute
