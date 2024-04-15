import { Column, DeepPartial, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Message } from './message.entity'
import { Location } from './location.entity'

@Entity()
export class User {
  constructor(datas: DeepPartial<User>) {
    Object.assign(this, datas)
  }

  @PrimaryGeneratedColumn('uuid')
  public id!: string

  @Column({ unique: true, type: 'text' })
  public username!: string

  @Column({ unique: true, type: 'text' })
  public email!: string

  @Column({ type: 'text', select: false })
  public password!: string

  @Column({
    type: 'text',
    enum: ['Admin', 'User'],
    default: 'User',
  })
  public role?: 'Admin' | 'User'

  @Column({ unique: true, type: 'text' })
  public phone_number!: string

  @Column({ type: 'text', nullable: true })
  public profile_pic?: string

  @Column({ type: 'text', nullable: true })
  public city?: string

  @Column({ type: 'text', nullable: true })
  public region?: string

  @Column({ type: 'text', nullable: true })
  public zip_code?: string

  @Column({ type: 'int', default: 0 })
  public score?: number

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP(6)' })
  public created_at!: Date

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  public updated_at!: Date

  @OneToMany(() => Message, (message) => message.user)
  public messages!: Message[]

  @OneToMany(() => Location, (location) => location.user)
  public location!: Location[]
}
