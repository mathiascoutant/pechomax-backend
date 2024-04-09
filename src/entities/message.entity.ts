import { Column, DeepPartial, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Category } from './category.entity'
import { User } from './user.entity'
import { Conversation } from './conversation.entity'

@Entity()
export class Message {
  constructor(datas: DeepPartial<Message>) {
    Object.assign(this, datas)
  }

  @PrimaryGeneratedColumn('uuid')
  public id!: string

  @Column({ type: 'text' })
  public content!: string

  @Column({ type: 'text', array: true })
  public pictures!: string[]

  @Column({ type: 'date' })
  public created_at!: Date

  @Column({ type: 'date' })
  public updated_at!: Date

  @Column({ type: 'uuid' })
  public conversation_id!: string

  @Column({ type: 'uuid' })
  public user_id!: string

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @JoinColumn({ name: 'conversation_id' })
  public conversation!: Category

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn({ name: 'user_id' })
  public user!: User
}
