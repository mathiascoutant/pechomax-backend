import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users'
import { relations } from 'drizzle-orm'
import { speciesLocation } from './speciesLocation'
import { catches } from './catches'

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

export const locationsRelations = relations(locations, ({ one, many }) => ({
  user: one(users, {
    fields: [locations.userId],
    references: [users.id],
  }),
  speciesLocations: many(speciesLocation),
  catches: many(catches),
}))

export type Location = typeof locations.$inferSelect
export type NewLocation = typeof locations.$inferInsert
