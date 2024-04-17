import { date, decimal, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { users } from './users'
import { species } from './species'

export const catches = pgTable('catches', {
  id: uuid('id').defaultRandom().primaryKey(),
  length: decimal('length', { precision: 5, scale: 2 }).notNull(),
  weight: decimal('weight', { precision: 5, scale: 2 }).notNull(),
  localisation: text('localisation').notNull(),
  pictures: text('pictures').array().notNull(),
  description: text('description'),
  pointValue: integer('point_value').notNull(),
  date: date('date').notNull(),
  speciesId: uuid('species_id').references(() => species.id),
  userId: uuid('user_id').references(() => users.id),
})

export type Catch = typeof catches.$inferSelect
export type NewCatch = typeof catches.$inferInsert
