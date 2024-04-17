import { userRolesEnum } from 'src/db/schema/users'

export interface Payload {
  id: string
  username: string
  role: (typeof userRolesEnum.enumValues)[number]
}
