import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Ficha } from '../entities/ficha.entity'

@Injectable()
export class FichasService {
  constructor(
    @InjectRepository(Ficha)
    private fichaRepository: Repository<Ficha>,
  ) {}

  async findAll(): Promise<Ficha[]> {
    return this.fichaRepository.find({ relations: ['formacion', 'usuarios'] })
  }

  async findOne(id: number): Promise<Ficha | undefined> {
    return this.fichaRepository.findOne({ where: { id }, relations: ['formacion', 'usuarios'] })
  }

  async create(ficha: Partial<Ficha>): Promise<Ficha> {
    const entity = this.fichaRepository.create({
      ...ficha,
      fechaInicio: ficha.fechaInicio ? new Date(ficha.fechaInicio) : undefined,
      fechaFin: ficha.fechaFin ? new Date(ficha.fechaFin) : undefined,
    })
    return this.fichaRepository.save(entity)
  }

  async update(id: number, ficha: Partial<Ficha>): Promise<Ficha | undefined> {
    const updateData: Partial<Ficha> = {}
    if (ficha.codigo !== undefined) updateData.codigo = ficha.codigo
    if (ficha.formacionId !== undefined) updateData.formacionId = ficha.formacionId
    if (ficha.fechaInicio !== undefined) updateData.fechaInicio = new Date(ficha.fechaInicio)
    if (ficha.fechaFin !== undefined) updateData.fechaFin = new Date(ficha.fechaFin)

    await this.fichaRepository.update(id, updateData)
    return this.findOne(id)
  }

  async remove(id: number): Promise<void> {
    await this.fichaRepository.delete(id)
  }
}