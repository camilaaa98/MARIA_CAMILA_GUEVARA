import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { Usuario } from './usuario.entity';
import { Lectura } from './lectura.entity';

@Entity('prestamos')
export class Prestamo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  usuarioId: number;

  @Column()
  @IsNumber({}, { message: 'El ID de la lectura debe ser un número' })
  @IsNotEmpty({ message: 'El ID de la lectura es requerido' })
  lecturaId: number;

  @Column()
  @IsDateString({}, { message: 'La fecha de préstamo debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de préstamo es requerida' })
  fechaPrestamo: Date;

  @Column({ nullable: true })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de devolución debe ser una fecha válida' })
  fechaDevolucion: Date | null;

  @Column()
  @IsDateString({}, { message: 'La fecha límite debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha límite es requerida' })
  fechaLimite: Date;

  @Column({ default: 'activo' })
  @IsOptional()
  estado: string; // 'activo', 'devuelto', 'vencido'

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  observaciones: string | null;

  @Column({ nullable: true })
  @IsOptional()
  renovaciones: number;

  @ManyToOne(() => Usuario, usuario => usuario.id)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @ManyToOne(() => Lectura, lectura => lectura.id)
  @JoinColumn({ name: 'lecturaId' })
  lectura: Lectura;
}