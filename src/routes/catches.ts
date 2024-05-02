import { zValidator } from '@hono/zod-validator'
import { and, eq } from 'drizzle-orm'
import { env } from 'hono/adapter'
import { catches } from 'src/db/schema/catches'
import { uploadCatch } from 'src/helpers/firebase'
import { HonoVar } from 'src/helpers/hono'
import { isAuth } from 'src/middlewares/isAuth'
import { z } from 'zod'

const catchesRoute = new HonoVar().basePath('/catches')

catchesRoute.get('/', zValidator('query', z.object({ page: z.coerce.number().optional() })), async (ctx) => {
  const db = ctx.get('database')
  const { page = 1 } = ctx.req.valid('query')

  const pageSize = Number(env(ctx).PAGE_SIZE)

  const catchList = await db.query.catches.findMany({
    with: {
      user: true,
      species: true,
    },
    limit: pageSize,
    offset: (page - 1) * pageSize,
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

catchesRoute.get('/self', isAuth(), async (ctx) => {
  const db = ctx.get('database')
  const { id } = ctx.get('userPayload')

  const catchList = await db.query.catches.findMany({
    where: (catchItem, { eq }) => eq(catchItem.userId, id),
    with: {
      species: true,
    },
  })

  return ctx.json(catchList)
})

catchesRoute.post(
  '/create',
  isAuth(),
  zValidator(
    'form',
    z.object({
      length: z.string(),
      weight: z.string(),
      speciesId: z.string(),
      localisation: z.string(),
      description: z.string(),
      date: z.string(),
      pictures: z.instanceof(File).optional(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { date, description, length, localisation, speciesId, weight, pictures } = ctx.req.valid('form')
    const { id } = ctx.get('userPayload')

    const species = await db.query.species.findFirst({
      where: (species, { eq }) => eq(species.id, speciesId),
      columns: { id: true, pointValue: true },
    })

    if (!species) {
      return ctx.json({ message: 'Species not found' }, 404)
    }

    if (pictures && pictures.size > Number(env(ctx).MAX_FILE_SIZE)) {
      return ctx.json({ message: 'File too large' }, 400)
    }

    const picturesUrl = pictures ? [await uploadCatch(pictures)] : []

    const catchList = await db
      .insert(catches)
      .values({
        date: new Date(date).toISOString(),
        length,
        weight,
        localisation,
        pictures: picturesUrl,
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

catchesRoute.put(
  '/update/:id',
  isAuth(),
  zValidator('param', z.object({ id: z.string() })),
  zValidator(
    'form',
    z.object({
      length: z.string().optional(),
      weight: z.string().optional(),
      localisation: z.string().optional(),
      description: z.string().optional().nullable(),
      date: z.string().optional(),
      pictures: z.instanceof(File).optional(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { date, description, length, localisation, weight, pictures } = ctx.req.valid('form')
    const { id } = ctx.req.valid('param')
    const { id: userId, role } = ctx.get('userPayload')

    if (pictures && pictures.size > Number(env(ctx).MAX_FILE_SIZE)) {
      return ctx.json({ message: 'File too large' }, 400)
    }

    const picturesUrl = pictures ? [await uploadCatch(pictures)] : undefined

    const newDate = date ? new Date(date).toISOString() : undefined

    const catchList = await db
      .update(catches)
      .set({ date: newDate, description, length, weight, localisation, pictures: picturesUrl })
      .where(role === 'Admin' ? eq(catches.id, id) : and(eq(catches.id, id), eq(catches.userId, userId)))
      .returning()

    if (catchList.length === 0) {
      return ctx.json({ message: 'Catch not found' }, 404)
    }

    const catchItem = catchList[0]

    return ctx.json(catchItem)
  }
)

catchesRoute.delete('/delete/:id', isAuth(), zValidator('param', z.object({ id: z.string() })), async (ctx) => {
  const db = ctx.get('database')
  const { id } = ctx.req.valid('param')
  const { id: userId, role } = ctx.get('userPayload')

  const catchList = await db
    .delete(catches)
    .where(role === 'Admin' ? eq(catches.id, id) : and(eq(catches.id, id), eq(catches.userId, userId)))
    .returning({
      id: catches.id,
    })

  if (catchList.length === 0) {
    return ctx.json({ message: 'Catch not found' }, 404)
  }

  return ctx.json({ message: 'Catch deleted' })
})

export default catchesRoute
