import { IsNotEmpty, IsString, IsEmail, IsNumber, IsOptional, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser texto' })
  nombre: string;

  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString({ message: 'El apellido debe ser texto' })
  apellido: string;

  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsNotEmpty({ message: 'El ID del rol es requerido' })
  @IsNumber({}, { message: 'El ID del rol debe ser un número' })
  rolId: number;

  @IsOptional()
  @IsNumber({}, { message: 'El ID de la ficha debe ser un número' })
  fichaId?: number;
}
