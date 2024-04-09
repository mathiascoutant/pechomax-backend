import { Column, DeepPartial, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Conversation } from './conversation.entity'

@Entity()
export class Category {
  constructor(datas: DeepPartial<Category>) {
    Object.assign(this, datas)
  }

  @PrimaryGeneratedColumn('uuid')
  public id!: string

  @Column({ unique: true, type: 'text' })
  public name!: string

  @OneToMany(() => Conversation, (conversation) => conversation.category)
  public conversation!: Conversation[]
}
