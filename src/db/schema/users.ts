import { relations } from 'drizzle-orm'
import { integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { levels } from './levels'
import { conversations } from './conversations'
import { messages } from './messages'
import { locations } from './locations'
import { catches } from './catches'

export const userRolesEnum = pgEnum('user_roles', ['Admin', 'User'])

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: text('username').unique().notNull(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  role: userRolesEnum('role').default('User'),
  phoneNumber: text('phone_number').unique(),
  profilePic: text('profile_pic'),
  city: text('city'),
  region: text('region'),
  zipCode: text('zip_code'),
  levelId: uuid('level_id').references(() => levels.id),
  score: integer('score').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const usersRelations = relations(users, ({ one, many }) => ({
  level: one(levels, {
    fields: [users.levelId],
    references: [levels.id],
  }),
  conversations: many(conversations),
  messages: many(messages),
  locations: many(locations),
  catches: many(catches),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
