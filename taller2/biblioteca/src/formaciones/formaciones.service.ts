import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Formacion } from '../entities/formacion.entity'

@Injectable()
export class FormacionesService {
  constructor(
    @InjectRepository(Formacion)
    private formacionRepository: Repository<Formacion>,
  ) {}

  async findAll(): Promise<Formacion[]> {
    return this.formacionRepository.find({ relations: ['fichas'] })
  }

  async findOne(id: number): Promise<Formacion | undefined> {
    const entity = await this.formacionRepository.findOne({ where: { id }, relations: ['fichas'] })
    return entity ?? undefined
  }

  async create(formacion: Partial<Formacion>): Promise<Formacion> {
    const entity = this.formacionRepository.create(formacion)
    return this.formacionRepository.save(entity)
  }

  async update(id: number, formacion: Partial<Formacion>): Promise<Formacion | undefined> {
    await this.formacionRepository.update(id, formacion)
    return this.findOne(id)
  }

  async remove(id: number): Promise<void> {
    await this.formacionRepository.delete(id)
  }
}