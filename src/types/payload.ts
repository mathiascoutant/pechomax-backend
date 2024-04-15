import { UserRoles } from 'src/modules/users/types/utilities'

export interface Payload {
  id: string
  role: UserRoles
  username: string
}
