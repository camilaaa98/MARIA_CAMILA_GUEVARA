import { IsString, IsNumber, IsDate } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  date: string; // formato: "YYYY-MM-DD"

  @IsString()
  time: string; // formato: "HH:mm"

  @IsString()
  reason: string;

  @IsNumber()
  value: number;

  @IsNumber()
  userId: number;

  @IsNumber()
  petId: number;

}
