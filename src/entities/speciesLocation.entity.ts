import { Column, DeepPartial, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Species } from './species.entity'
import { Location } from './location.entity'

@Entity()
export class SpeciesLocation {
  constructor(datas: DeepPartial<SpeciesLocation>) {
    Object.assign(this, datas)
  }

  @PrimaryGeneratedColumn('uuid')
  public id!: string

  @Column({ type: 'text' })
  public species_id!: string

  @Column({ type: 'text' })
  public location_id!: string

  @ManyToOne(() => Species, (species) => species.species_location)
  @JoinColumn({ name: 'species_id' })
  public species!: Species

  @ManyToOne(() => Location, (location) => location.species_location)
  @JoinColumn({ name: 'location_id' })
  public location!: Location
}
