import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prestamo } from '../entities/prestamo.entity';
import { Usuario } from '../entities/usuario.entity';
import { Lectura } from '../entities/lectura.entity';
import { CreatePrestamoDto } from './dto/create-prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';

@Injectable()
export class PrestamosService {
  constructor(
    @InjectRepository(Prestamo)
    private prestamosRepository: Repository<Prestamo>,
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    @InjectRepository(Lectura)
    private lecturasRepository: Repository<Lectura>,
  ) {}

  async findAll(): Promise<Prestamo[]> {
    return this.prestamosRepository.find({
      relations: ['usuario', 'lectura'],
      order: { fechaPrestamo: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Prestamo> {
    const prestamo = await this.prestamosRepository.findOne({
      where: { id },
      relations: ['usuario', 'lectura']
    });
    
    if (!prestamo) {
      throw new NotFoundException(`Préstamo con ID ${id} no encontrado`);
    }
    
    return prestamo;
  }

  async findByUsuario(usuarioId: number): Promise<Prestamo[]> {
    return this.prestamosRepository.find({
      where: { usuarioId },
      relations: ['usuario', 'lectura'],
      order: { fechaPrestamo: 'DESC' }
    });
  }

  async create(createPrestamoDto: CreatePrestamoDto): Promise<Prestamo> {
    // Verificar que el usuario existe y está activo
    const usuario = await this.usuariosRepository.findOne({
      where: { id: createPrestamoDto.usuarioId }
    });
    
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${createPrestamoDto.usuarioId} no encontrado`);
    }
    
    if (!usuario.activo) {
      throw new BadRequestException('El usuario está inactivo y no puede solicitar préstamos');
    }
    
    if (usuario.sancionado) {
      throw new BadRequestException('El usuario está sancionado y no puede solicitar préstamos');
    }

    // Verificar que la lectura existe y está disponible
    const lectura = await this.lecturasRepository.findOne({
      where: { id: createPrestamoDto.lecturaId }
    });
    
    if (!lectura) {
      throw new NotFoundException(`Lectura con ID ${createPrestamoDto.lecturaId} no encontrada`);
    }
    
    if (!lectura.disponible) {
      throw new BadRequestException('La lectura no está disponible para préstamo');
    }

    // Verificar que el usuario no tenga préstamos vencidos
    const prestamosVencidos = await this.prestamosRepository.count({
      where: { 
        usuarioId: createPrestamoDto.usuarioId,
        estado: 'vencido'
      }
    });
    
    if (prestamosVencidos > 0) {
      throw new BadRequestException('El usuario tiene préstamos vencidos y no puede solicitar nuevos préstamos');
    }

    // Crear el préstamo
    const prestamo = this.prestamosRepository.create({
      ...createPrestamoDto,
      fechaPrestamo: new Date(),
      fechaLimite: new Date(createPrestamoDto.fechaLimite),
      estado: 'activo',
      renovaciones: 0
    });

    const nuevoPrestamo = await this.prestamosRepository.save(prestamo);

    // Marcar la lectura como no disponible
    await this.lecturasRepository.update(createPrestamoDto.lecturaId, { disponible: false });

    return this.findOne(nuevoPrestamo.id);
  }

  async update(id: number, updatePrestamoDto: UpdatePrestamoDto): Promise<Prestamo> {
    const prestamo = await this.findOne(id);
    
    // Si se está devolviendo el libro
    if (updatePrestamoDto.estado === 'devuelto' && prestamo.estado !== 'devuelto') {
      updatePrestamoDto.fechaDevolucion = new Date().toISOString();
      
      // Marcar la lectura como disponible nuevamente
      await this.lecturasRepository.update(prestamo.lecturaId, { disponible: true });
    }

    await this.prestamosRepository.update(id, {
      ...updatePrestamoDto,
      fechaDevolucion: updatePrestamoDto.fechaDevolucion ? new Date(updatePrestamoDto.fechaDevolucion) : undefined
    });
    
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const prestamo = await this.findOne(id);
    
    // Si el préstamo está activo, marcar la lectura como disponible
    if (prestamo.estado === 'activo') {
      await this.lecturasRepository.update(prestamo.lecturaId, { disponible: true });
    }
    
    await this.prestamosRepository.delete(id);
  }

  async renovarPrestamo(id: number): Promise<Prestamo> {
    const prestamo = await this.findOne(id);
    
    if (prestamo.estado !== 'activo') {
      throw new BadRequestException('Solo se pueden renovar préstamos activos');
    }
    
    if (prestamo.renovaciones >= 2) {
      throw new BadRequestException('El préstamo ya ha sido renovado el máximo de veces permitidas');
    }

    // Extender la fecha límite por 15 días más
    const nuevaFechaLimite = new Date(prestamo.fechaLimite);
    nuevaFechaLimite.setDate(nuevaFechaLimite.getDate() + 15);

    await this.prestamosRepository.update(id, {
      fechaLimite: nuevaFechaLimite,
      renovaciones: prestamo.renovaciones + 1
    });

    return this.findOne(id);
  }

  async marcarVencidos(): Promise<void> {
    const fechaActual = new Date();
    
    await this.prestamosRepository
      .createQueryBuilder()
      .update(Prestamo)
      .set({ estado: 'vencido' })
      .where('fechaLimite < :fecha AND estado = :estado', { 
        fecha: fechaActual, 
        estado: 'activo' 
      })
      .execute();
  }
}