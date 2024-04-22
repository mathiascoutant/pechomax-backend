import { zValidator } from '@hono/zod-validator'
import { and, eq } from 'drizzle-orm'
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


export default conversationsRoute
