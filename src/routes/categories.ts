import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { categories } from 'src/db/schema/categories'
import { HonoVar } from 'src/helpers/hono'
import { isAuth } from 'src/middlewares/isAuth'
import { z } from 'zod'

const categoriesRoute = new HonoVar().basePath('/categories')

categoriesRoute.post(
  '/create',
  isAuth('Admin'),
  zValidator(
    'json',
    z.object({
      name: z.string().min(3),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { name } = ctx.req.valid('json')

    const categoryList = await db.insert(categories).values({ name }).returning()

    if (categoryList.length === 0) {
      return ctx.json({ message: 'Internal server error' }, 500)
    }

    const category = categoryList[0]

    return ctx.json(category, 201)
  }
)

categoriesRoute.get('/', async (ctx) => {
  const db = ctx.get('database')

  const categoryList = await db.query.categories.findMany()

  return ctx.json(categoryList)
})

categoriesRoute.get(
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

    const categoryList = await db.query.categories.findMany({ where: (cat, { eq }) => eq(cat.id, id) })

    if (categoryList.length === 0) {
      return ctx.json({ message: 'Category not found' }, 404)
    }

    const category = categoryList[0]

    return ctx.json(category, 200)
  }
)

categoriesRoute.put(
  '/update/:id',
  isAuth('Admin'),
  zValidator(
    'param',
    z.object({
      id: z.string(),
    })
  ),
  zValidator(
    'json',
    z.object({
      name: z.string().min(3),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { id } = ctx.req.valid('param')
    const updateDatas = ctx.req.valid('json')

    const categoryList = await db.update(categories).set(updateDatas).where(eq(categories.id, id)).returning()

    if (categoryList.length === 0) {
      return ctx.json({ message: 'Category not found' }, 404)
    }

    const category = categoryList[0]

    return ctx.json(category, 201)
  }
)

categoriesRoute.delete(
  '/delete/:id',
  isAuth('Admin'),
  zValidator('param', z.object({ id: z.string() })),
  async (ctx) => {
    const db = ctx.get('database')
    const { id } = ctx.req.valid('param')

    const categoryList = await db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id })

    if (categoryList.length === 0) {
      return ctx.json({ message: 'Category not found' }, 404)
    }

    const category = categoryList[0]

    return ctx.json(category, 200)
  }
)

export default categoriesRoute
