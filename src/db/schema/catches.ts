import { date, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { users } from './users'
import { species } from './species'
import { relations } from 'drizzle-orm'

export const catches = pgTable('catches', {
  id: uuid('id').defaultRandom().primaryKey(),
  length: integer('length').notNull(),
  weight: integer('weight').notNull(),
  localisation: text('localisation').notNull(),
  pictures: text('pictures').array().notNull(),
  description: text('description'),
  pointValue: integer('point_value').notNull(),
  date: date('date').notNull(),
  speciesId: uuid('species_id').references(() => species.id),
  userId: uuid('user_id').references(() => users.id),
})

export const catchesRlations = relations(catches, ({ one }) => ({
  user: one(users, {
    fields: [catches.userId],
    references: [users.id],
  }),
  species: one(species, {
    fields: [catches.speciesId],
    references: [species.id],
  }),
}))

export type Catch = typeof catches.$inferSelect
export type NewCatch = typeof catches.$inferInsert
