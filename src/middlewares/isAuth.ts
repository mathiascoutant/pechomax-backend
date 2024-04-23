import { env } from 'hono/adapter'
import { getSignedCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'
import { userRolesEnum } from 'src/db/schema/users'
import { type HonoVarMiddleware } from 'src/helpers/hono'
import { Payload } from 'src/types/payload'

export const isAuth: (
  ...roleList: (typeof userRolesEnum.enumValues)[number][]
) => HonoVarMiddleware<{ userPayload: Payload; Bindings: typeof process.env }> = function (...roleList) {
  return async (ctx, next) => {
    const { COOKIE_SECRET, JWT_SECRET } = env(ctx)
    const token = await getSignedCookie(ctx, COOKIE_SECRET, 'access_token')

    if (!token) {
      return ctx.json({ message: 'Unauthorized' }, 401)
    }

    const payload = await verify(token, JWT_SECRET)

    if (!payload) {
      return ctx.json({ message: 'Unauthorized' }, 401)
    }

    if (roleList.length > 0 && !roleList.includes(payload.role)) {
      return ctx.json({ message: 'Unauthorized' }, 401)
    }

    ctx.set('userPayload', payload)

    await next()
  }
}
