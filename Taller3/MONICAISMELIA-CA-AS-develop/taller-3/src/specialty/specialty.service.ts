import { ConflictException, Injectable } from '@nestjs/common';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Specialty } from './entities/specialty.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SpecialtyService {
    constructor(
        @InjectRepository(Specialty)
        private specialtyRepository: Repository<Specialty>,
    ){}

    //crear la especialidad
    async create(createSpecialtyDto: CreateSpecialtyDto): Promise<Specialty> {
        const existingSpecialty = await this.specialtyRepository.findOne({
            where: { specialty_name: createSpecialtyDto.specialty_name}
        });
        if (existingSpecialty){
            throw new ConflictException('Esta especialidad ya existe.');
        }

        const newSpecialty = this.specialtyRepository.create(createSpecialtyDto);

        return this.specialtyRepository.save(newSpecialty);
    }

    //lectura de especialidades
    async findAll(): Promise<Specialty[]>{
        return this.specialtyRepository.find();
    }


}
