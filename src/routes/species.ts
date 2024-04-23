import { zValidator } from '@hono/zod-validator'
import { HonoVar } from 'src/helpers/hono'
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

export default speciesRoute
