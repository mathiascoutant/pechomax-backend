import { pgTable, uuid } from 'drizzle-orm/pg-core'
import { species } from './species'
import { locations } from './locations'
import { relations } from 'drizzle-orm'

export const speciesLocation = pgTable('speciesLocation', {
  id: uuid('id').defaultRandom().primaryKey(),
  speciesId: uuid('species_id').references(() => species.id),
  locationId: uuid('location_id').references(() => locations.id),
})

export const sepciesLocationsRelations = relations(speciesLocation, ({ one }) => ({
  species: one(species, {
    fields: [speciesLocation.speciesId],
    references: [species.id],
  }),
  location: one(locations, {
    fields: [speciesLocation.locationId],
    references: [locations.id],
  }),
}))

export type SpeciesLocation = typeof speciesLocation.$inferSelect
export type NewSpeciesLocation = typeof speciesLocation.$inferInsert
