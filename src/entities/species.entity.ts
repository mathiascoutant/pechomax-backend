import { Catch } from './catch.entity'
import { Column, DeepPartial, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { SpeciesLocation } from './speciesLocation.entity'

@Entity()
export class Species {
  constructor(datas: DeepPartial<Species>) {
    Object.assign(this, datas)
  }

  @PrimaryGeneratedColumn('uuid')
  public id!: string

  @Column({ unique: true, type: 'text' })
  public name!: string

  @Column({ type: 'integer' })
  public point_value!: number

  @OneToMany(() => Catch, (catchEntity) => catchEntity.species)
  public catch!: Catch[]

  @OneToMany(() => SpeciesLocation, (speciesLocation) => speciesLocation.species)
  public species_location!: SpeciesLocation[]
}
