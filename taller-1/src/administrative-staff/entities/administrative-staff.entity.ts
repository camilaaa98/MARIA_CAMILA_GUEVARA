import { User } from '../../user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity('administrative_staff')
export class AdministrativeStaff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  userId: number; // ← Relación con User (tabla usuarios)

  @OneToOne (()=> User, user => user.administrativeStaff)
  @JoinColumn({ name: 'userId'})
  user: User;

  @Column()
  identification: string; // Identificación (CC, etc.)

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'date' })
  startDate: string; // Fecha de ingreso

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
