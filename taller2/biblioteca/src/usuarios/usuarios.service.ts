import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      relations: ['rol', 'ficha', 'ficha.formacion'],
    });
  }

  async findOne(id: number): Promise<Usuario | undefined> {
    return this.usuarioRepository.findOne({
      where: { id },
      relations: ['rol', 'ficha', 'ficha.formacion'],
    });
  }

  async findByEmail(email: string): Promise<Usuario | undefined> {
    return this.usuarioRepository.findOne({
      where: { email },
      relations: ['rol', 'ficha', 'ficha.formacion'],
    });
  }

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const usuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      activo: true,
      sancionado: false,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    });
    return this.usuarioRepository.save(usuario);
  }

  async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario | undefined> {
    await this.usuarioRepository.update(id, {
      ...updateUsuarioDto,
      fechaActualizacion: new Date()
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usuarioRepository.delete(id);
  }

  // Métodos administrativos
  async activarUsuario(id: number): Promise<Usuario | undefined> {
    await this.usuarioRepository.update(id, { 
      activo: true,
      fechaActualizacion: new Date()
    });
    return this.findOne(id);
  }

  async desactivarUsuario(id: number): Promise<Usuario | undefined> {
    await this.usuarioRepository.update(id, { 
      activo: false,
      fechaActualizacion: new Date()
    });
    return this.findOne(id);
  }

  async sancionarUsuario(id: number, motivo: string): Promise<Usuario | undefined> {
    await this.usuarioRepository.update(id, {
      sancionado: true,
      fechaSancion: new Date(),
      motivoSancion: motivo,
      fechaActualizacion: new Date()
    });
    return this.findOne(id);
  }

  async levantarSancion(id: number): Promise<Usuario | undefined> {
    await this.usuarioRepository.update(id, {
      sancionado: false,
      fechaSancion: null,
      motivoSancion: null,
      fechaActualizacion: new Date()
    });
    return this.findOne(id);
  }

  async agregarObservacion(id: number, observacion: string): Promise<Usuario | undefined> {
    const usuario = await this.findOne(id);
    if (!usuario) return undefined;

    const observacionesActuales = usuario.observaciones || '';
    const nuevaObservacion = `${new Date().toISOString()}: ${observacion}`;
    const observacionesActualizadas = observacionesActuales 
      ? `${observacionesActuales}\n${nuevaObservacion}`
      : nuevaObservacion;

    await this.usuarioRepository.update(id, {
      observaciones: observacionesActualizadas,
      fechaActualizacion: new Date()
    });
    return this.findOne(id);
  }

  async obtenerUsuariosActivos(): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      where: { activo: true },
      relations: ['rol', 'ficha', 'ficha.formacion'],
    });
  }

  async obtenerUsuariosSancionados(): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      where: { sancionado: true },
      relations: ['rol', 'ficha', 'ficha.formacion'],
    });
  }
}