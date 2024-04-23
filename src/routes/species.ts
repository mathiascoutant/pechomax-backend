import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { species } from 'src/db/schema/species'
import { HonoVar } from 'src/helpers/hono'
import { isAuth } from 'src/middlewares/isAuth'
import { z } from 'zod'

const speciesRoute = new HonoVar().basePath('species')

speciesRoute.get('/', async (ctx) => {
  const db = ctx.get('database')

  const species = await db.query.species.findMany()

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
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { name, pointValue } = ctx.req.valid('json')

    const speciesList = await db.insert(species).values({ name, pointValue }).returning()

    if (speciesList.length === 0) {
      return ctx.json({ message: 'Failed to create species' }, 500)
    }

    const speciesItem = speciesList[0]

    return ctx.json(speciesItem)
  }
)

speciesRoute.put(
  '/update/:id',
  isAuth('Admin'),
  zValidator('param', z.object({ id: z.string() })),
  zValidator('json', z.object({ name: z.string().optional(), pointValue: z.number().optional() })),
  async (ctx) => {
    const db = ctx.get('database')
    const { id } = ctx.req.valid('param')
    const updateSpecies = ctx.req.valid('json')

    const speciesList = await db.update(species).set(updateSpecies).where(eq(species.id, id)).returning()

    if (speciesList.length === 0) {
      return ctx.json({ message: 'Species not found' }, 404)
    }

    const speciesItem = speciesList[0]

    return ctx.json(speciesItem)
  }
)

export default speciesRoute
