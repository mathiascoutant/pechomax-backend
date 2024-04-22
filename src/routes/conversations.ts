import { zValidator } from '@hono/zod-validator'
import { and, eq } from 'drizzle-orm'
import { conversations } from 'src/db/schema/conversations'
import { HonoVar } from 'src/helpers/hono'
import { isAuth } from 'src/middlewares/isAuth'
import { z } from 'zod'

const conversationsRoute = new HonoVar().basePath('/conversations')

conversationsRoute.get('/', async (ctx) => {
  const db = ctx.get('database')

  const conversations = await db.query.conversations.findMany()

  ctx.json(conversations)
})

conversationsRoute.get(
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

    const conversation = await db.query.conversations.findFirst({
      where: (conv, { eq }) => eq(conv.id, id),
    })

    if (!conversation) {
      return ctx.json({ message: 'Conversation not found' }, 404)
    }

    ctx.json(conversation)
  }
)

conversationsRoute.post(
  '/create',
  isAuth(),
  zValidator(
    'json',
    z.object({
      title: z.string().min(3),
      categoryId: z.string(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const payload = ctx.get('userPayload')
    const { title, categoryId } = ctx.req.valid('json')

    const conversationList = await db
      .insert(conversations)
      .values({
        title: title,
        categoryId,
        userId: payload.id,
      })
      .returning()

    if (conversationList.length === 0) {
      return ctx.json({ message: 'Internal server error' }, 500)
    }

    const conversation = conversationList[0]

    ctx.json(conversation, 201)
  }
)

conversationsRoute.put(
  '/update/:id',
  isAuth(),
  zValidator(
    'param',
    z.object({
      id: z.string(),
    })
  ),
  zValidator(
    'json',
    z.object({
      title: z.string().min(3),
      categoryId: z.string(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { role, id: userId } = ctx.get('userPayload')
    const { id } = ctx.req.valid('param')
    const { title, categoryId } = ctx.req.valid('json')

    const conversationList = await db
      .update(conversations)
      .set({
        title,
        categoryId,
      })
      .where(
        role === 'Admin' ? eq(conversations.id, id) : and(eq(conversations.id, id), eq(conversations.userId, userId))
      )
      .returning()

    if (conversationList.length === 0) {
      return ctx.json({ message: 'Conversation not found' }, 404)
    }

    const conversation = conversationList[0]

    ctx.json(conversation)
  }
)

conversationsRoute.delete('/delete/:id', isAuth(), zValidator('param', z.object({ id: z.string() })), async (ctx) => {
  const db = ctx.get('database')
  const { id } = ctx.req.valid('param')
  const { role, id: userId } = ctx.get('userPayload')

  const conversationList = await db
    .delete(conversations)
    .where(
      role === 'Admin' ? eq(conversations.id, id) : and(eq(conversations.id, id), eq(conversations.userId, userId))
    )
    .returning({
      id: conversations.id,
    })

  if (conversationList.length === 0) {
    return ctx.json({ message: 'Conversation not found' }, 404)
  }

  const conversation = conversationList[0]

  ctx.json(conversation, 200)
})

export default conversationsRoute
