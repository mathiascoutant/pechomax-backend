import { getSignedCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'
import { userRolesEnum } from 'src/db/schema/users'
import { type HonoVarMiddleware } from 'src/helpers/hono'
import { Payload } from 'src/types/payload'

export const isAuth: (
  ...roleList: (typeof userRolesEnum.enumValues)[number][]
) => HonoVarMiddleware<{ userPayload: Payload }> = function (...roleList) {
  return async (ctx, next) => {
    const token = await getSignedCookie(ctx, 'access_token', process.env.COOKIE_SECRET)

    if (!token) {
      return ctx.json({ message: 'Unauthorized' }, 401)
    }

    const payload = await verify(token, process.env.JWT_SECRET)

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
