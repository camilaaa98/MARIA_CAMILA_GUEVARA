import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Categoria } from './categoria.entity';

@Entity('lecturas')
export class Lectura {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es requerido' })
  titulo: string;

  @Column()
  @IsString({ message: 'El autor debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El autor es requerido' })
  autor: string;

  @Column({ type: 'date' })
  @IsDate({ message: 'La fecha de publicación debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de publicación es requerida' })
  fechaPublicacion: Date;

  @Column()
  @IsString({ message: 'La editorial debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La editorial es requerida' })
  editorial: string;

  @Column()
  @IsBoolean({ message: 'La disponibilidad debe ser un valor booleano' })
  disponible: boolean;

  @Column()
  @IsNumber({}, { message: 'El ID de la categoría debe ser un número' })
  @IsNotEmpty({ message: 'El ID de la categoría es requerido' })
  categoriaId: number;

  @ManyToOne(() => Categoria, categoria => categoria.lecturas)
  @JoinColumn({ name: 'categoriaId' })
  categoria: Categoria;
}