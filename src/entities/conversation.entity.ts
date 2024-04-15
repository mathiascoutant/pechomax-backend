import { Column, DeepPartial, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Category } from './category.entity'
import { Message } from './message.entity'

@Entity()
export class Conversation {
  constructor(datas: DeepPartial<Conversation>) {
    Object.assign(this, datas)
  }

  @PrimaryGeneratedColumn('uuid')
  public id!: string

  @Column({ type: 'text' })
  public title!: string

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP(6)' })
  public created_at!: Date

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  public updated_at!: Date

  @Column({ type: 'uuid' })
  public category_id!: string

  @ManyToOne(() => Category, (category) => category.conversation)
  @JoinColumn({ name: 'category_id' })
  public category!: Category

  @OneToMany(() => Message, (message) => message.conversation)
  public messages!: Message[]
}
