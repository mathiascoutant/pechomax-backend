import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'

export const levels = pgTable('levels', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').unique().notNull(),
  value: integer('value').unique().notNull(),
  start: integer('start').notNull(),
  score: integer('score').notNull(),
})

export type Level = typeof levels.$inferSelect
export type NewLevel = typeof levels.$inferInsert
