import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateClientOwnerDto {
  @IsNumber()
  clientId: number;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
