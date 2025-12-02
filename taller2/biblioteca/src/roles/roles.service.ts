import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Rol } from '../entities/rol.entity'

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
  ) {}

  async findAll(): Promise<Rol[]> {
    return this.rolRepository.find({ relations: ['usuarios'] })
  }

  async findOne(id: number): Promise<Rol | undefined> {
    return this.rolRepository.findOne({ where: { id }, relations: ['usuarios'] })
  }

  async create(rol: Partial<Rol>): Promise<Rol> {
    const entity = this.rolRepository.create(rol)
    return this.rolRepository.save(entity)
  }

  async update(id: number, rol: Partial<Rol>): Promise<Rol | undefined> {
    await this.rolRepository.update(id, rol)
    return this.findOne(id)
  }

  async remove(id: number): Promise<void> {
    await this.rolRepository.delete(id)
  }
}