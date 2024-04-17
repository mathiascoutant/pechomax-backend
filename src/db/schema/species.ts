import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'

export const species = pgTable('species', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').unique(),
  pointValue: integer('point_value'),
})

export type Species = typeof species.$inferSelect
export type NewSpecies = typeof species.$inferInsert
