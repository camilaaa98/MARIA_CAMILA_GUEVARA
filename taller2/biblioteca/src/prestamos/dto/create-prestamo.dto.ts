import { IsNotEmpty, IsNumber, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePrestamoDto {
  @ApiProperty({ description: 'ID del usuario que solicita el préstamo' })
  @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  usuarioId: number;

  @ApiProperty({ description: 'ID de la lectura a prestar' })
  @IsNumber({}, { message: 'El ID de la lectura debe ser un número' })
  @IsNotEmpty({ message: 'El ID de la lectura es requerido' })
  lecturaId: number;

  @ApiProperty({ description: 'Fecha límite para la devolución' })
  @IsDateString({}, { message: 'La fecha límite debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha límite es requerida' })
  fechaLimite: string;

  @ApiProperty({ description: 'Observaciones del préstamo', required: false })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto' })
  observaciones?: string;
}