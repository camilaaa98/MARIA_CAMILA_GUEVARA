import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lectura } from '../entities/lectura.entity';
import { CreateLecturaDto } from './dto/create-lectura.dto';
import { UpdateLecturaDto } from './dto/update-lectura.dto';

@Injectable()
export class LecturasService {

  constructor(
    @InjectRepository(Lectura)
    private lecturaRepository: Repository<Lectura>,
  ) {}


  async findAll(): Promise<Lectura[]> {
    return this.lecturaRepository.find({ relations: ['categoria'] });
  }

  async findOne(id: number): Promise<Lectura | undefined> {
    return this.lecturaRepository.findOne({ 
      where: { id }, 
      relations: ['categoria'] 
    });
  }

  async create(createLecturaDto: CreateLecturaDto): Promise<Lectura> {
    const lectura = new Lectura();
    lectura.titulo = createLecturaDto.titulo;
    lectura.autor = createLecturaDto.autor;
    lectura.fechaPublicacion = new Date(createLecturaDto.fechaPublicacion);
    lectura.editorial = createLecturaDto.editorial;
    lectura.disponible = createLecturaDto.disponible;
    lectura.categoriaId = createLecturaDto.categoriaId;
    
    return this.lecturaRepository.save(lectura);
  }

  async update(id: number, updateLecturaDto: UpdateLecturaDto): Promise<Lectura | undefined> {
    const updateData: Partial<Lectura> = {};
    
    if (updateLecturaDto.titulo !== undefined) updateData.titulo = updateLecturaDto.titulo;
    if (updateLecturaDto.autor !== undefined) updateData.autor = updateLecturaDto.autor;
    if (updateLecturaDto.editorial !== undefined) updateData.editorial = updateLecturaDto.editorial;
    if (updateLecturaDto.disponible !== undefined) updateData.disponible = updateLecturaDto.disponible;
    if (updateLecturaDto.categoriaId !== undefined) updateData.categoriaId = updateLecturaDto.categoriaId;
    if (updateLecturaDto.fechaPublicacion !== undefined) {
      updateData.fechaPublicacion = new Date(updateLecturaDto.fechaPublicacion);
    }
    
    await this.lecturaRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.lecturaRepository.delete(id);
  }

  // Métodos administrativos
  async marcarDisponible(id: number): Promise<Lectura | undefined> {
    await this.lecturaRepository.update(id, { disponible: true });
    return this.findOne(id);
  }

  async marcarNoDisponible(id: number): Promise<Lectura | undefined> {
    await this.lecturaRepository.update(id, { disponible: false });
    return this.findOne(id);
  }

  async obtenerLecturasDisponibles(): Promise<Lectura[]> {
    return this.lecturaRepository.find({
      where: { disponible: true },
      relations: ['categoria']
    });
  }

  async obtenerLecturasNoDisponibles(): Promise<Lectura[]> {
    return this.lecturaRepository.find({
      where: { disponible: false },
      relations: ['categoria']
    });
  }

  async buscarPorTitulo(titulo: string): Promise<Lectura[]> {
    return this.lecturaRepository
      .createQueryBuilder('lectura')
      .leftJoinAndSelect('lectura.categoria', 'categoria')
      .where('lectura.titulo LIKE :titulo', { titulo: `%${titulo}%` })
      .getMany();
  }

  async buscarPorAutor(autor: string): Promise<Lectura[]> {
    return this.lecturaRepository
      .createQueryBuilder('lectura')
      .leftJoinAndSelect('lectura.categoria', 'categoria')
      .where('lectura.autor LIKE :autor', { autor: `%${autor}%` })
      .getMany();
  }
}