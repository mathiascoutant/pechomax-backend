import { Hono, MiddlewareHandler } from 'hono'
import type { DbType } from 'src/db/init'

export const HonoVar = Hono<{ Variables: { database: DbType } }>

export type HonoVarMiddleware<T extends { [K: string]: unknown }> = MiddlewareHandler<{
  Variables: { database: DbType } & T
}>
