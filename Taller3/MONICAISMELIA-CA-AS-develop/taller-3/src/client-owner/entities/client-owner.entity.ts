import { Bill } from '../../bill/entity/bill.entity';
import { Pet } from '../../pet/entities/pet.entity';
import { Rol } from '../../rol/entities/rol_entities.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('client_owners')
export class ClientOwner {
  @PrimaryGeneratedColumn()
  Id_client: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @ManyToOne(() => Rol, (rol)=> rol.clientOwners)
  @JoinColumn({ name: 'id_rol' })
  rol:Rol;

  @OneToMany(()=> Pet, (pet)=>pet.client)
  pets: Pet[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(()=>Bill, (bill)=> bill.client)
  bills: Bill[];
}
