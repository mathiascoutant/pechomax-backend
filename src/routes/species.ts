import { zValidator } from '@hono/zod-validator'
import { eq, inArray } from 'drizzle-orm'
import { species } from 'src/db/schema/species'
import { HonoVar } from 'src/helpers/hono'
import { isAuth } from 'src/middlewares/isAuth'
import { z } from 'zod'
import { env } from 'hono/adapter'
import { speciesLocation } from 'src/db/schema/speciesLocation'

const speciesRoute = new HonoVar().basePath('species')

speciesRoute.get('/', zValidator('query', z.object({ page: z.coerce.number().optional() })), async (ctx) => {
  const db = ctx.get('database')
  const { page = 1 } = ctx.req.valid('query')

  const pageSize = Number(env(ctx).PAGE_SIZE)

  const species = await db.query.species.findMany({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    with: { speciesLoactions: { with: { location: true } } },
  })

  return ctx.json(species)
})

speciesRoute.get(
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

    const species = await db.query.species.findFirst({
      where: (species, { eq }) => eq(species.id, id),
      with: { speciesLoactions: { with: { location: true } } },
    })

    if (!species) {
      return ctx.json({ message: 'Species not found' }, 404)
    }

    return ctx.json(species)
  }
)

speciesRoute.post(
  '/create',
  isAuth('Admin'),
  zValidator(
    'json',
    z.object({
      name: z.string(),
      pointValue: z.number(),
      locationIds: z.string().array().optional(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { name, pointValue, locationIds } = ctx.req.valid('json')

    const speciesList = await db.insert(species).values({ name, pointValue }).returning()

    if (speciesList.length === 0) {
      return ctx.json({ message: 'Failed to create species' }, 500)
    }

    const speciesItem = speciesList[0]

    if (locationIds && locationIds.length > 0) {
      const speciesLoactionList = await db
        .insert(speciesLocation)
        .values(locationIds.map((id) => ({ locationId: id, speciesId: speciesItem.id })))
        .returning()

      if (speciesLoactionList.length === 0) {
        return ctx.json({ message: 'Failed to link species to location' }, 500)
      }
    }

    const returningSpecies = await db.query.species.findFirst({
      where: (species, { eq }) => eq(species.id, speciesItem.id),
      with: { speciesLoactions: { with: { location: true } } },
    })

    return ctx.json(returningSpecies)
  }
)

speciesRoute.put(
  '/update/:id',
  isAuth('Admin'),
  zValidator('param', z.object({ id: z.string() })),
  zValidator(
    'json',
    z.object({
      name: z.string().optional(),
      pointValue: z.number().optional(),
      locationIds: z.string().array().optional(),
      deleteLocationIds: z.string().array().optional(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { id } = ctx.req.valid('param')
    const { locationIds, deleteLocationIds, ...updateSpecies } = ctx.req.valid('json')

    const speciesList = await db.update(species).set(updateSpecies).where(eq(species.id, id)).returning()

    if (speciesList.length === 0) {
      return ctx.json({ message: 'Species not found' }, 404)
    }

    const speciesItem = speciesList[0]

    if (locationIds && locationIds.length > 0) {
      const speciesLoactionList = await db
        .insert(speciesLocation)
        .values(locationIds.map((id) => ({ locationId: id, speciesId: speciesItem.id })))
        .returning()

      if (speciesLoactionList.length === 0) {
        return ctx.json({ message: 'Failed to link species to location' }, 500)
      }
    }

    if (deleteLocationIds && deleteLocationIds.length > 0) {
      await db.delete(speciesLocation).where(inArray(speciesLocation.locationId, deleteLocationIds))
    }

    const returningSpecies = await db.query.species.findFirst({
      where: (species, { eq }) => eq(species.id, speciesItem.id),
      with: { speciesLoactions: { with: { location: true } } },
    })

    return ctx.json(returningSpecies)
  }
)

speciesRoute.delete('/delete/:id', isAuth('Admin'), zValidator('param', z.object({ id: z.string() })), async (ctx) => {
  const db = ctx.get('database')
  const { id } = ctx.req.valid('param')

  const speciesList = await db.delete(species).where(eq(species.id, id)).returning({
    id: species.id,
  })

  if (speciesList.length === 0) {
    return ctx.json({ message: 'Species not found' }, 404)
  }

  return ctx.json({ message: 'Species deleted' })
})

export default speciesRoute
