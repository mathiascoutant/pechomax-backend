import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users'
import { conversations } from './conversations'
import { relations } from 'drizzle-orm'

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  content: text('content').notNull(),
  pictures: text('pictures').array().notNull(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  conversationId: uuid('conversation_id')
    .references(() => conversations.id)
    .notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}))

export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert
