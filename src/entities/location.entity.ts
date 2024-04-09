import { Column, DeepPartial, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './user.entity'
import { SpeciesLocation } from './speciesLocation.entity'

@Entity()
export class Location {
  constructor(datas: DeepPartial<Location>) {
    Object.assign(this, datas)
  }

  @PrimaryGeneratedColumn('uuid')
  public id!: string

  @Column({ unique: true, type: 'text' })
  public longitude!: string

  @Column({ unique: true, type: 'text' })
  public latitude!: string

  @Column({ type: 'text' })
  public name!: string

  @Column({ type: 'text' })
  public description!: string

  @Column({ type: 'date' })
  public created_at!: string

  @Column({ type: 'date' })
  public updated_at!: string

  @Column({ type: 'text' })
  public user_id!: string

  @ManyToOne(() => User, (user) => user.location)
  @JoinColumn({ name: 'user_id' })
  public user!: User

  @OneToMany(() => SpeciesLocation, (speciesLocation) => speciesLocation.species)
  public species_location!: SpeciesLocation[]
}
