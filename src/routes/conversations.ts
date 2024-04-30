import { zValidator } from '@hono/zod-validator'
import { and, eq } from 'drizzle-orm'
import { conversations } from 'src/db/schema/conversations'
import { messages } from 'src/db/schema/messages'
import { uploadMessage } from 'src/helpers/firebase'
import { HonoVar } from 'src/helpers/hono'
import { isAuth } from 'src/middlewares/isAuth'
import { z } from 'zod'

const conversationsRoute = new HonoVar().basePath('/conversations')

conversationsRoute.get('/', zValidator('query', z.object({ page: z.coerce.number().optional() })), async (ctx) => {
  const db = ctx.get('database')
  const { page = 1 } = ctx.req.valid('query')

  const pageSize = Number(process.env.PAGE_SIZE)

  const conversations = await db.query.conversations.findMany({
    with: {
      messages: true,
      user: true,
      category: true,
    },
    limit: pageSize,
    offset: (page - 1) * pageSize,
  })

  return ctx.json(conversations)
})

conversationsRoute.get('/self', isAuth(), async (ctx) => {
  const db = ctx.get('database')
  const { id } = ctx.get('userPayload')

  const conversations = await db.query.conversations.findMany({
    where: (conv, { eq }) => eq(conv.userId, id),
    with: { messages: { limit: 3, orderBy: (msg, { desc }) => [desc(msg.createdAt)] }, user: true, category: true },
    orderBy: (conv, { desc }) => [desc(conv.createdAt)],
  })

  return ctx.json(conversations)
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
      with: {
        messages: {
          orderBy: (msg, { desc }) => [desc(msg.createdAt)],
          with: {
            user: true,
          },
        },
        user: true,
        category: true,
      },
      orderBy: (conv, { desc }) => [desc(conv.createdAt)],
    })

    if (!conversation) {
      return ctx.json({ message: 'Conversation not found' }, 404)
    }

    return ctx.json(conversation)
  }
)

conversationsRoute.get(
  '/:id/messages',
  zValidator(
    'param',
    z.object({
      id: z.string(),
    })
  ),
  zValidator('query', z.object({ page: z.coerce.number().optional() })),
  async (ctx) => {
    const db = ctx.get('database')
    const { id } = ctx.req.valid('param')
    const { page = 1 } = ctx.req.valid('query')

    const pageSize = Number(process.env.PAGE_SIZE)

    const messageList = await db.query.messages.findMany({
      where: (msg, { eq }) => eq(msg.conversationId, id),
      with: {
        user: true,
      },
      limit: pageSize,
      offset: (page - 1) * pageSize,
    })

    if (messageList.length === 0) {
      return ctx.json({ message: 'Conversation not found' }, 404)
    }

    return ctx.json(messageList)
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

    return ctx.json(conversation, 201)
  }
)

conversationsRoute.post(
  '/start',
  isAuth(),
  zValidator(
    'form',
    z.object({
      title: z.string().min(3),
      categoryId: z.string(),
      content: z.string(),
      pictures: z.instanceof(File).optional().nullable(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const payload = ctx.get('userPayload')
    const { title, categoryId, content, pictures } = ctx.req.valid('form')

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

    const picturesUrl = pictures ? [await uploadMessage(pictures)] : []

    const messageList = await db
      .insert(messages)
      .values({ content, conversationId: conversation.id, userId: payload.id, pictures: picturesUrl })
      .returning()

    if (messageList.length === 0) {
      return ctx.json({ message: 'Internal server error' }, 500)
    }

    const message = messageList[0]

    return ctx.json({ conversation, message }, 201)
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
      title: z.string().min(3).optional(),
      categoryId: z.string().optional(),
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

    return ctx.json(conversation)
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

  return ctx.json(conversation, 200)
})

export default conversationsRoute
