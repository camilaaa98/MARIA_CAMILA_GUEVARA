import { IsOptional, IsDateString, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePrestamoDto {
  @ApiProperty({ description: 'Fecha de devolución', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de devolución debe ser una fecha válida' })
  fechaDevolucion?: string;

  @ApiProperty({ description: 'Estado del préstamo', enum: ['activo', 'devuelto', 'vencido'], required: false })
  @IsOptional()
  @IsString({ message: 'El estado debe ser texto' })
  @IsIn(['activo', 'devuelto', 'vencido'], { message: 'El estado debe ser: activo, devuelto o vencido' })
  estado?: string;

  @ApiProperty({ description: 'Observaciones del préstamo', required: false })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto' })
  observaciones?: string;

  @ApiProperty({ description: 'Número de renovaciones', required: false })
  @IsOptional()
  renovaciones?: number;
}