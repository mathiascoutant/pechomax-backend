import { zValidator } from '@hono/zod-validator'
import { and, eq } from 'drizzle-orm'
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

locationsRoute.put(
  '/update/:id',
  isAuth(),
  zValidator('param', z.object({ id: z.string() })),
  zValidator(
    'json',
    z.object({
      longitude: z.string().optional(),
      latitude: z.string().optional(),
      name: z.string().optional(),
      description: z.string().optional(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { id } = ctx.req.valid('param')
    const updateDatas = ctx.req.valid('json')

    const locationList = await db.update(locations).set(updateDatas).where(eq(locations.id, id)).returning()

    if (locationList.length === 0) {
      return ctx.json({ message: 'Failed to update location' }, 500)
    }

    const locationItem = locationList[0]

    return ctx.json(locationItem)
  }
)

locationsRoute.delete('/delete/:id', isAuth(), zValidator('param', z.object({ id: z.string() })), async (ctx) => {
  const db = ctx.get('database')
  const { id } = ctx.req.valid('param')
  const { id: userId, role } = ctx.get('userPayload')

  const locationList = await db
    .delete(locations)
    .where(role === 'Admin' ? eq(locations.id, id) : and(eq(locations.id, id), eq(locations.userId, userId)))
    .returning({
      id: locations.id,
    })

  if (locationList.length === 0) {
    return ctx.json({ message: 'Location not found' }, 404)
  }

  return ctx.json({ message: 'Location deleted' })
})

export default locationsRoute
