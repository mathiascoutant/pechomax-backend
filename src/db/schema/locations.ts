import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users'

export const locations = pgTable('locations', {
  id: uuid('id').defaultRandom().primaryKey(),
  longitude: text('longitude').unique().notNull(),
  latitude: text('latitude').unique().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  userId: uuid('user_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type Location = typeof locations.$inferSelect
export type NewLocation = typeof locations.$inferInsert
