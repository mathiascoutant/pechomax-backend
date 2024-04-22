import { zValidator } from '@hono/zod-validator'
import { HonoVar } from 'src/helpers/hono'
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

export default messagesRoute
