import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AppointmentStatus } from '../enum/appointmentenum';
import { Bill } from '../../bill/entity/bill.entity';
import { Pet } from '../../pet/entities/pet.entity';
import { User } from '../../user/entities/user.entity';
import { MedicalHistory } from '../../medical-history/entities/medical-history.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  Id_appo: number;

  @Column({ type: 'date' })
  date: string;

  @Column()
  time: string;

  @Column()
  reason: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
    name: 'status'
  })
  status: AppointmentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({nullable: true})
  Id_bill: number;  

  @OneToOne(()=> Bill, (bill)=> bill.appointment)
  @JoinColumn({name: 'Id_bill', 
    referencedColumnName: 'Id_bill'
  }
  )
  bill: Bill;

  @Column()
  Id_pet: number;

  @ManyToOne(()=> Pet, (pet)=>pet.appointments)
  @JoinColumn({name: 'Id_pet', 
    referencedColumnName: 'Id_pet'
  })
  pet: Pet;

  @Column()
  Id_users: number;

  @ManyToOne(()=> User, (user)=>user.appointments )
  @JoinColumn({name: 'Id_users', 
    referencedColumnName: 'Id_users'
  })
  user: User;

  @OneToMany(()=>MedicalHistory, (medicalhistory)=>medicalhistory.appointment)
  medicalHistory: MedicalHistory[];

}
