import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { speciesLocation } from 'src/db/schema/speciesLocation'
import { HonoVar } from 'src/helpers/hono'
import { isAuth } from 'src/middlewares/isAuth'
import { z } from 'zod'

const speciesLocationRoute = new HonoVar().basePath('speciesLocation').use(isAuth('Admin'))

speciesLocationRoute.get('/', async (ctx) => {
  const db = ctx.get('database')

  const speciesLocations = await db.query.speciesLocation.findMany()

  return ctx.json(speciesLocations)
})

speciesLocationRoute.get(
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

    const speciesLocation = await db.query.speciesLocation.findFirst({
      where: (speciesLocation, { eq }) => eq(speciesLocation.id, id),
    })

    if (!speciesLocation) {
      return ctx.json({ message: 'SpeciesLocation not found' }, 404)
    }

    return ctx.json(speciesLocation)
  }
)

speciesLocationRoute.post(
  '/create',
  zValidator(
    'json',
    z.object({
      speciesId: z.string(),
      locationId: z.string(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { speciesId, locationId } = ctx.req.valid('json')

    const speciesLocationList = await db.insert(speciesLocation).values({ speciesId, locationId }).returning()

    if (speciesLocationList.length === 0) {
      return ctx.json({ message: 'Failed to create speciesLocation' }, 500)
    }

    const speciesLocationItem = speciesLocationList[0]

    return ctx.json(speciesLocationItem)
  }
)

speciesLocationRoute.put(
  '/update/:id',
  zValidator('param', z.object({ id: z.string() })),
  zValidator(
    'json',
    z.object({
      speciesId: z.string().optional(),
      locationId: z.string().optional(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const updateDatas = ctx.req.valid('json')
    const { id } = ctx.req.valid('param')

    const speciesLocationList = await db
      .update(speciesLocation)
      .set(updateDatas)
      .where(eq(speciesLocation.id, id))
      .returning()

    if (speciesLocationList.length === 0) {
      return ctx.json({ message: 'Failed to update speciesLocation' }, 500)
    }

    const speciesLocationItem = speciesLocationList[0]

    return ctx.json(speciesLocationItem)
  }
)

export default speciesLocationRoute
