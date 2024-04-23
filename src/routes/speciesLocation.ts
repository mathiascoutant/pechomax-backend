import { zValidator } from '@hono/zod-validator'
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

export default speciesLocationRoute
