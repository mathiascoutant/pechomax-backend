import { Column, DeepPartial, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './user.entity'
import { Species } from './species.entity'

@Entity()
export class Catch {
  constructor(datas: DeepPartial<Catch>) {
    Object.assign(this, datas)
  }

  @PrimaryGeneratedColumn('uuid')
  public id!: string

  @Column({ type: 'float' })
  public length!: number

  @Column({ type: 'float' })
  public weight!: number

  @Column({ type: 'text' })
  public localisation!: string

  @Column({ type: 'text', array: true })
  public pictures!: string[]

  @Column({ type: 'text' })
  public description!: string

  @Column({ type: 'int' })
  public point_value!: number

  @Column({ type: 'date' })
  public date!: Date

  @Column({ type: 'uuid' })
  public species_id!: string

  @Column({ type: 'uuid' })
  public user_id!: string

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn({ name: 'user_id' })
  public user!: User

  @ManyToOne(() => Species, (species) => species.catch)
  @JoinColumn({ name: 'species_id' })
  public species!: Species[]
}
