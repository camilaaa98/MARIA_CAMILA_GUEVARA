import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Formacion } from './formacion.entity';
import { Usuario } from './usuario.entity';

@Entity('fichas')
export class Ficha {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El código es requerido' })
  codigo: string;

  @Column()
  @IsNumber({}, { message: 'El ID de la formación debe ser un número' })
  @IsNotEmpty({ message: 'El ID de la formación es requerido' })
  formacionId: number;

  @Column({ type: 'date' })
  @IsDate({ message: 'La fecha de inicio debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  fechaInicio: Date;

  @Column({ type: 'date' })
  @IsDate({ message: 'La fecha de fin debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de fin es requerida' })
  fechaFin: Date;

  @ManyToOne(() => Formacion, formacion => formacion.fichas)
  @JoinColumn({ name: 'formacionId' })
  formacion: Formacion;

  @OneToMany(() => Usuario, usuario => usuario.ficha)
  usuarios: Usuario[];
}