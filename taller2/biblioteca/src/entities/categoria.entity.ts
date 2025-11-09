import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { Lectura } from './lectura.entity';

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @Column()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion: string;

  @OneToMany(() => Lectura, lectura => lectura.categoriaId)
  lecturas: Lectura[];
}