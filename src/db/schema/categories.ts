import { relations } from 'drizzle-orm'
import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { conversations } from './conversations'

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').unique().notNull(),
})

export const categoriesRelations = relations(categories, ({ many }) => ({
  conversations: many(conversations),
}))

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
