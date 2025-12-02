import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePetDto {
  @IsString()
  name: string;

  @IsString()
  species: string;

  @IsString()
  breed: string;

  @IsString()
  sex: string;

  @IsNumber()
  weight: number;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsNumber()
  clientId: number;
}
