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

catchesRoute.post(
  '/create',
  isAuth(),
  zValidator(
    'json',
    z.object({
      length: z.string(),
      weight: z.string(),
      speciesId: z.string(),
      localisation: z.string(),
      description: z.string(),
      date: z.date(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { date, description, length, localisation, speciesId, weight } = ctx.req.valid('json')
    const { id } = ctx.get('userPayload')

    const species = await db.query.species.findFirst({
      where: (species, { eq }) => eq(species.id, speciesId),
      columns: { id: true, pointValue: true },
    })

    if (!species) {
      return ctx.json({ message: 'Species not found' }, 404)
    }

    const catchList = await db
      .insert(catches)
      .values({
        date: date.toISOString(),
        length,
        weight,
        localisation,
        pictures: [],
        pointValue: species.pointValue * length.length * weight.length,
        userId: id,
        description,
        speciesId,
      })
      .returning()

    if (catchList.length === 0) {
      return ctx.json({ message: 'Failed to create catch' }, 500)
    }

    const catchItem = catchList[0]

    return ctx.json(catchItem)
  }
)

export default catchesRoute
