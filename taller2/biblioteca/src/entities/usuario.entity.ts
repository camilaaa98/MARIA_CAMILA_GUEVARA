import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { Rol } from './rol.entity';
import { Ficha } from './ficha.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @Column()
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  apellido: string;

  @Column({ unique: true })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @Column()
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @Column()
  @IsNumber({}, { message: 'El ID del rol debe ser un número' })
  @IsNotEmpty({ message: 'El ID del rol es requerido' })
  rolId: number;

  @Column({ nullable: true })
  @IsNumber({}, { message: 'El ID de la ficha debe ser un número' })
  @IsOptional()
  fichaId: number | null;

  @Column({ default: true })
  @IsOptional()
  activo: boolean;

  @Column({ default: false })
  @IsOptional()
  sancionado: boolean;

  @Column({ nullable: true })
  @IsOptional()
  fechaSancion: Date | null;

  @Column({ nullable: true })
  @IsOptional()
  motivoSancion: string | null;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  observaciones: string | null;

  @Column({ nullable: true })
  @IsOptional()
  fechaCreacion: Date;

  @Column({ nullable: true })
  @IsOptional()
  fechaActualizacion: Date;

  @ManyToOne(() => Rol, rol => rol.usuarios)
  @JoinColumn({ name: 'rolId' })
  rol: Rol;

  @ManyToOne(() => Ficha, ficha => ficha.usuarios, { nullable: true })
  @JoinColumn({ name: 'fichaId' })
  ficha: Ficha;
}