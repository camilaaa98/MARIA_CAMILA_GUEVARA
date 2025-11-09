import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../entities/categoria.entity';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private categoriaRepository: Repository<Categoria>,
  ) {}

  async findAll(): Promise<Categoria[]> {
    return this.categoriaRepository.find();
  }

  async findOne(id: number): Promise<Categoria | undefined> {
    return this.categoriaRepository.findOne({ where: { id } });
  }

  async create(categoria: Partial<Categoria>): Promise<Categoria> {
    return this.categoriaRepository.save(categoria);
  }

  async update(id: number, categoria: Partial<Categoria>): Promise<Categoria | undefined> {
    await this.categoriaRepository.update(id, categoria);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.categoriaRepository.delete(id);
  }
}