import { SetMetadata } from '@nestjs/common'
import { UserRoles } from 'src/modules/users/types/utilities'

export const Roles = (...args: Array<UserRoles>) => SetMetadata('roles', args)
