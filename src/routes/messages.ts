import { zValidator } from '@hono/zod-validator'
import { and, eq } from 'drizzle-orm'
import { messages } from 'src/db/schema/messages'
import { uploadMessage } from 'src/helpers/firebase'
import { HonoVar } from 'src/helpers/hono'
import { isAuth } from 'src/middlewares/isAuth'
import { z } from 'zod'

const messagesRoute = new HonoVar().basePath('messages')

messagesRoute.get('/', async (ctx) => {
  const db = ctx.get('database')

  const messages = await db.query.messages.findMany({ with: { user: true } })

  return ctx.json(messages)
})

messagesRoute.get(
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

    const message = await db.query.messages.findFirst({
      with: { user: true },
      where: (msg, { eq }) => eq(msg.id, id),
    })

    if (!message) {
      return ctx.json({ message: 'Message not found' }, 404)
    }

    return ctx.json(message)
  }
)

messagesRoute.get('/self', isAuth(), async (ctx) => {
  const db = ctx.get('database')
  const { id } = ctx.get('userPayload')

  const messages = await db.query.messages.findMany({
    where: (msg, { eq }) => eq(msg.userId, id),
  })

  return ctx.json(messages)
})

messagesRoute.post(
  '/create',
  isAuth(),
  zValidator(
    'form',
    z.object({
      conversationId: z.string(),
      content: z.string(),
      pictures: z.instanceof(File).optional(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { conversationId, content, pictures } = ctx.req.valid('form')
    const { id: userId } = ctx.get('userPayload')

    const picturesUrl = pictures ? [await uploadMessage(pictures)] : []

    const messageList = await db
      .insert(messages)
      .values({ conversationId, content, userId, pictures: picturesUrl })
      .returning()

    if (messageList.length === 0) {
      return ctx.json({ message: 'Failed to create message' }, 500)
    }

    const message = messageList[0]

    return ctx.json(message)
  }
)

messagesRoute.put(
  '/update/:id',
  isAuth(),
  zValidator(
    'param',
    z.object({
      id: z.string(),
    })
  ),
  zValidator(
    'form',
    z.object({
      content: z.string().optional(),
      pictures: z.instanceof(File).optional(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { id: userId, role } = ctx.get('userPayload')
    const { id } = ctx.req.valid('param')
    const { pictures, ...updateMessage } = ctx.req.valid('form')

    const messageList = await db
      .update(messages)
      .set({ ...updateMessage, pictures: [await uploadMessage(pictures)] })
      .where(role === 'Admin' ? eq(messages.id, id) : and(eq(messages.id, id), eq(messages.userId, userId)))
      .returning()

    if (messageList.length === 0) {
      return ctx.json({ message: 'Message not found' }, 404)
    }

    const message = messageList[0]

    return ctx.json(message)
  }
)

messagesRoute.delete('/delete/:id', isAuth(), zValidator('param', z.object({ id: z.string() })), async (ctx) => {
  const db = ctx.get('database')
  const { id: userId, role } = ctx.get('userPayload')
  const { id } = ctx.req.valid('param')

  const messageList = await db
    .delete(messages)
    .where(role === 'Admin' ? eq(messages.id, id) : and(eq(messages.id, id), eq(messages.userId, userId)))
    .returning({
      id: messages.id,
    })

  if (messageList.length === 0) {
    return ctx.json({ message: 'Message not found' }, 404)
  }

  const message = messageList[0]

  return ctx.json(message)
})

export default messagesRoute
