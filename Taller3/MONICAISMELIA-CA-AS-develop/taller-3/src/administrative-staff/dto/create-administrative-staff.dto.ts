import { IsNumber, IsString } from 'class-validator';

export class CreateAdministrativeStaffDto {
  @IsNumber()
  userId: number;

  @IsString()
  identification: string; 

  @IsString()
  phone: string;

  @IsString()
  startDate: string; // formato: "YYYY-MM-DD"
}
