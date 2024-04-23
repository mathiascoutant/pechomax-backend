import { zValidator } from '@hono/zod-validator'
import { locations } from 'src/db/schema/locations'
import { HonoVar } from 'src/helpers/hono'
import { isAuth } from 'src/middlewares/isAuth'
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

locationsRoute.post(
  '/create',
  isAuth(),
  zValidator(
    'json',
    z.object({
      longitude: z.string(),
      latitude: z.string(),
      name: z.string(),
      description: z.string(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { id } = ctx.get('userPayload')
    const { longitude, latitude, name, description } = ctx.req.valid('json')

    const locationList = await db
      .insert(locations)
      .values({ longitude, latitude, name, description, userId: id })
      .returning()

    if (locationList.length === 0) {
      return ctx.json({ message: 'Failed to create location' }, 500)
    }

    const locationItem = locationList[0]

    return ctx.json(locationItem)
  }
)

export default locationsRoute
