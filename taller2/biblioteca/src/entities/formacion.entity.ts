import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Ficha } from './ficha.entity';

@Entity('formaciones')
export class Formacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @Column()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion: string;

  @Column()
  @IsNumber({}, { message: 'La duración debe ser un número' })
  @Min(1, { message: 'La duración debe ser mayor a 0' })
  duracion: number;

  @OneToMany(() => Ficha, ficha => ficha.formacion)
  fichas: Ficha[];
}