import { zValidator } from '@hono/zod-validator'
import { and, eq, inArray } from 'drizzle-orm'
import { locations } from 'src/db/schema/locations'
import { HonoVar } from 'src/helpers/hono'
import { isAuth } from 'src/middlewares/isAuth'
import { z } from 'zod'
import { env } from 'hono/adapter'
import { speciesLocation } from 'src/db/schema/speciesLocation'

const locationsRoute = new HonoVar().basePath('locations')

locationsRoute.get('/', zValidator('query', z.object({ page: z.coerce.number().optional() })), async (ctx) => {
  const db = ctx.get('database')
  const { page = 1 } = ctx.req.valid('query')

  const pageSize = Number(env(ctx).PAGE_SIZE)

  const locations = await db.query.locations.findMany({
    with: { user: true, speciesLocations: { with: { species: true } } },
    limit: pageSize,
    offset: (page - 1) * pageSize,
    orderBy: (loc, { desc }) => desc(loc.updatedAt),
  })

  return ctx.json(locations)
})

locationsRoute.get('/all', async (ctx) => {
  const db = ctx.get('database')

  const locations = await db.query.locations.findMany({
    with: { user: true, speciesLocations: { with: { species: true } } },
  })

  return ctx.json(locations)
})

locationsRoute.get('/self', isAuth(), async (ctx) => {
  const db = ctx.get('database')
  const { id } = ctx.get('userPayload')

  const locations = await db.query.locations.findMany({
    where: (location, { eq }) => eq(location.userId, id),
    with: { speciesLocations: { with: { species: true } } },
  })

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
      with: { user: true, speciesLocations: { with: { species: true } } },
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
      speciesIds: z.string().array().optional(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { id } = ctx.get('userPayload')
    const { longitude, latitude, name, description, speciesIds } = ctx.req.valid('json')

    const locationList = await db
      .insert(locations)
      .values({ longitude, latitude, name, description, userId: id })
      .returning()

    if (locationList.length === 0) {
      return ctx.json({ message: 'Failed to create location' }, 500)
    }

    const locationItem = locationList[0]

    if (speciesIds && speciesIds.length > 0) {
      const speciesLocationList = await db
        .insert(speciesLocation)
        .values(speciesIds.map((id) => ({ locationId: locationItem.id, speciesId: id })))
        .returning()

      if (speciesLocationList.length === 0) {
        return ctx.json({ message: 'Failed to link location to species' }, 500)
      }
    }

    const returningLocation = await db.query.locations.findFirst({
      where: (location, { eq }) => eq(location.id, locationItem.id),
      with: { speciesLocations: { with: { species: true } } },
    })

    return ctx.json(returningLocation)
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
      description: z.string().optional().nullable(),
      speciesIds: z.string().array().optional(),
      deleteSpeciesIds: z.string().array().optional(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { id } = ctx.req.valid('param')
    const { speciesIds, deleteSpeciesIds, ...updateDatas } = ctx.req.valid('json')
    const { id: userId, role } = ctx.get('userPayload')

    const locationList = await db
      .update(locations)
      .set(updateDatas)
      .where(role === 'Admin' ? eq(locations.id, id) : and(eq(locations.id, id), eq(locations.userId, userId)))
      .returning()

    if (locationList.length === 0) {
      return ctx.json({ message: 'Failed to update location' }, 500)
    }

    const locationItem = locationList[0]

    if (speciesIds && speciesIds.length > 0) {
      const speciesLocationList = await db
        .insert(speciesLocation)
        .values(speciesIds.map((id) => ({ locationId: locationItem.id, speciesId: id })))
        .returning()

      if (speciesLocationList.length === 0) {
        return ctx.json({ message: 'Failed to link location to species' }, 500)
      }
    }

    if (deleteSpeciesIds && deleteSpeciesIds.length > 0) {
      await db.delete(speciesLocation).where(inArray(speciesLocation.speciesId, deleteSpeciesIds))
    }

    const returningLocation = await db.query.locations.findFirst({
      where: (location, { eq }) => eq(location.id, locationItem.id),
      with: { speciesLocations: { with: { species: true } } },
    })

    return ctx.json(returningLocation)
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
