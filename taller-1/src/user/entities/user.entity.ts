// src/user/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, ManyToMany, OneToMany } from 'typeorm';
import { AdministrativeStaff } from '../../administrative-staff/entities/administrative-staff.entity';
import { MedicalHistory } from '../../medical-history/entities/medical-history.entity';
import { Appointment } from '../../appointment/entities/appointment.entity';
import { MedicalStaff } from '../../medical-staff/entities/medical-staff.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  Id_users: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  ID_rol: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(()=>AdministrativeStaff, (administrativeStaff) => administrativeStaff.user)
  administrativeStaff: AdministrativeStaff;

  @OneToOne(()=> MedicalStaff, (medicalstaff)=>medicalstaff.user)
  medicalstaff: MedicalStaff;

  @ManyToMany(() => MedicalHistory, (MedicalHistory)=> MedicalHistory.users)
  medicalHistory: MedicalHistory[];

  @OneToMany(()=>Appointment, (appointment)=>appointment.user)
  appointments: Appointment[];
}