import { relations } from 'drizzle-orm'
import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { catches } from './catches'
import { speciesLocation } from './speciesLocation'

export const species = pgTable('species', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').unique(),
  pointValue: integer('point_value'),
})

export const speciesRlations = relations(species, ({ many }) => ({
  catches: many(catches),
  speciesLoactions: many(speciesLocation),
}))

export type Species = typeof species.$inferSelect
export type NewSpecies = typeof species.$inferInsert
