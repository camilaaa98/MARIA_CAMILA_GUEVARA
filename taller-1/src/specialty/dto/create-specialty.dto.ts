import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateSpecialtyDto{
    @IsNotEmpty({ message: 'El nombre de la expecialidad no puede quedar vacio'})
    @IsString()
    @MaxLength(100)
    specialty_name: string;
}