import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { messages } from 'src/db/schema/messages'
import { HonoVar } from 'src/helpers/hono'
import { isAuth } from 'src/middlewares/isAuth'
import { z } from 'zod'

const messagesRoute = new HonoVar().basePath('messages')

messagesRoute.get('/', async (ctx) => {
  const db = ctx.get('database')

  const messages = await db.query.messages.findMany()

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
      where: (msg, { eq }) => eq(msg.id, id),
    })

    if (!message) {
      return ctx.json({ message: 'Message not found' }, 404)
    }

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
    'json',
    z.object({
      content: z.string(),
      pictures: z.string().array(),
    })
  ),
  async (ctx) => {
    const db = ctx.get('database')
    const { id } = ctx.req.valid('param')
    const updateMessage = ctx.req.valid('json')

    const messageList = await db.update(messages).set(updateMessage).where(eq(messages.id, id)).returning()

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
