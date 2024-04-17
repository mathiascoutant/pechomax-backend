import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { categories } from './categories'

export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  categoryId: uuid('category_id').references(() => categories.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert
