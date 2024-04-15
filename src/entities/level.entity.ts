import { Column, DeepPartial, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Level {
  constructor(datas: DeepPartial<Level>) {
    Object.assign(this, datas)
  }

  @PrimaryGeneratedColumn('uuid')
  public id!: string

  @Column({ unique: true, type: 'text' })
  public title!: string

  @Column({ unique: true, type: 'integer' })
  public value!: number

  @Column({ type: 'integer' })
  public start!: number

  @Column({ type: 'integer' })
  public score!: number
}
