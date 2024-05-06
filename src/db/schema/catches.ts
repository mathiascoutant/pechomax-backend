import { date, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users'
import { species } from './species'
import { relations } from 'drizzle-orm'
import { locations } from './locations'

export const catches = pgTable('catches', {
  id: uuid('id').defaultRandom().primaryKey(),
  length: integer('length').notNull(),
  weight: integer('weight').notNull(),
  locationId: uuid('location_id')
    .references(() => locations.id, { onDelete: 'cascade' })
    .notNull(),
  pictures: text('pictures').array().notNull(),
  description: text('description'),
  pointValue: integer('point_value').notNull(),
  date: date('date').notNull(),
  speciesId: uuid('species_id').references(() => species.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
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
  location: one(locations, {
    fields: [catches.locationId],
    references: [locations.id],
  }),
}))

export type Catch = typeof catches.$inferSelect
export type NewCatch = typeof catches.$inferInsert
