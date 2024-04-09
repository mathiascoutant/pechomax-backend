import { User } from 'src/entities/user.entity'

export type UserRoles = typeof User.prototype.role

export type CleanUser = Omit<User, 'password'>
