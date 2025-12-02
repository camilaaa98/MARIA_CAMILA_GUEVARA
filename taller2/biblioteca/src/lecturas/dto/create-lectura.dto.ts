import { IsNotEmpty, IsString, IsBoolean, IsNumber, IsDateString } from 'class-validator';

export class CreateLecturaDto {
  @IsNotEmpty({ message: 'El título es requerido' })
  @IsString({ message: 'El título debe ser texto' })
  titulo: string;

  @IsNotEmpty({ message: 'El autor es requerido' })
  @IsString({ message: 'El autor debe ser texto' })
  autor: string;

  @IsNotEmpty({ message: 'La fecha de publicación es requerida' })
  @IsDateString({}, { message: 'La fecha debe ser válida (YYYY-MM-DD)' })
  fechaPublicacion: string;

  @IsNotEmpty({ message: 'La editorial es requerida' })
  @IsString({ message: 'La editorial debe ser texto' })
  editorial: string;

  @IsNotEmpty({ message: 'La disponibilidad es requerida' })
  @IsBoolean({ message: 'La disponibilidad debe ser true o false' })
  disponible: boolean;

  @IsNotEmpty({ message: 'El ID de categoría es requerido' })
  @IsNumber({}, { message: 'El ID de categoría debe ser un número' })
  categoriaId: number;
}
