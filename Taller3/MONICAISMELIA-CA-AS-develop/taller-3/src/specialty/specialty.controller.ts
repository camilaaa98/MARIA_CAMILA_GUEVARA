import { Body, ConflictException, Controller, Get, Post } from '@nestjs/common';
import { SpecialtyService } from './specialty.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { Specialty } from './entities/specialty.entity';

@Controller('specialty')
export class SpecialtyController {
    constructor(private readonly specialtyService: SpecialtyService ) {}

    /** 
     * @method: POST
     * @route: /specialty
     * 
    */

    @Post()
    async create(@Body() CreateSpecialtyDto: CreateSpecialtyDto): Promise<Specialty>{
        try{
            return await this.specialtyService.create(CreateSpecialtyDto);
        } catch (error){
            if (error.message.includes('Ya exite esta es pecialidad')) {
                throw new ConflictException(error.message);
            }

            throw error;
        }

    }
    @Get ()
    async findAll(): Promise<Specialty[]>{
        return this.specialtyService.findAll();
    }
}
