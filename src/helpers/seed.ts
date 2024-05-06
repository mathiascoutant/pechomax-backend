import { faker } from '@faker-js/faker'
import { db } from '../db/init'
import { users } from 'src/db/schema/users'
import { categories } from 'src/db/schema/categories'
import { levels } from 'src/db/schema/levels'
import { conversations } from 'src/db/schema/conversations'
import { messages } from 'src/db/schema/messages'
import { species } from 'src/db/schema/species'
import { locations } from 'src/db/schema/locations'
import { speciesLocation } from 'src/db/schema/speciesLocation'
import { catches } from 'src/db/schema/catches'
import { randomFrom, randomNumber, randomsFrom } from './random'

async function createUser(role: 'User' | 'Admin', level: string, username?: string, password?: string) {
  const user = await db
    .insert(users)
    .values({
      email: faker.internet.email(),
      password: password ?? faker.internet.password(),
      username: username ?? faker.person.firstName(),
      role: role,
      profilePic: 'https://thispersondoesnotexist.com/',
      levelId: level,
    })
    .returning()

  return user[0]
}

async function createCategory() {
  const cat = await db
    .insert(categories)
    .values({
      name: faker.lorem.word(),
    })
    .returning()

  return cat[0]
}

async function createLevel(value: number, start: number, end?: number) {
  const level = await db
    .insert(levels)
    .values({
      title: faker.lorem.word(),
      value,
      start,
      end: end ?? null,
    })
    .returning()

  return level[0]
}

async function createConversation(owner: string, cat: string) {
  const conversation = await db
    .insert(conversations)
    .values({
      userId: owner,
      title: faker.lorem.word(),
      categoryId: cat,
    })
    .returning()

  return conversation[0]
}

async function createMessage(owner: string, conv: string) {
  const message = await db
    .insert(messages)
    .values({
      userId: owner,
      conversationId: conv,
      content: faker.lorem.sentence(),
      pictures: [],
    })
    .returning()

  return message[0]
}

async function createSpecies() {
  const spc = await db
    .insert(species)
    .values({ name: faker.lorem.word(), pointValue: faker.number.int({ max: 100 }) })
    .returning()

  return spc[0]
}

async function createLocation(owner: string, species: string[]) {
  const loc = await db
    .insert(locations)
    .values({
      latitude: faker.location.latitude().toString(),
      longitude: faker.location.longitude().toString(),
      name: faker.lorem.word(),
      userId: owner,
      description: faker.lorem.sentence(),
    })
    .returning()

  await Promise.all(species.map((s) => db.insert(speciesLocation).values({ locationId: loc[0].id, speciesId: s })))

  return loc[0]
}

async function createCatch(owner: string, species: string, location: string) {
  const catchesItem = await db.insert(catches).values({
    date: faker.date.recent().toISOString(),
    length: faker.number.int({ max: 100 }),
    weight: faker.number.int({ max: 100 }),
    locationId: location,
    pictures: [],
    pointValue: faker.number.int({ max: 100 }),
    description: faker.lorem.sentence(),
    userId: owner,
    speciesId: species,
  })

  return catchesItem[0]
}

export default async function seedDb() {
  const levelList = await Promise.all([
    createLevel(1, 0, 100),
    createLevel(2, 101, 200),
    createLevel(3, 201, 300),
    createLevel(4, 301),
  ])

  const userList = await Promise.all([
    ...Array.from({ length: 10 }, () => createUser('User', levelList[0].id)),
    createUser('Admin', levelList[0].id, 'admin', 'adminadmin'),
  ])

  const catList = await Promise.all(Array.from({ length: 3 }, () => createCategory()))

  const conversationList = await Promise.all(
    Array.from({ length: 20 }, () => createConversation(randomFrom(userList).id, randomFrom(catList).id))
  )

  for (const conv of conversationList) {
    await Promise.all(Array.from({ length: 10 }, () => createMessage(randomFrom(userList).id, conv.id)))
  }

  const speciesList = await Promise.all(Array.from({ length: 10 }, () => createSpecies()))

  const locationList = await Promise.all(
    Array.from({ length: 10 }, () =>
      createLocation(
        randomFrom(userList).id,
        randomsFrom(speciesList, randomNumber(5)).map((s) => s.id)
      )
    )
  )

  await Promise.all(
    Array.from({ length: 10 }, () =>
      createCatch(randomFrom(userList).id, randomFrom(speciesList).id, randomFrom(locationList).id)
    )
  )
}
