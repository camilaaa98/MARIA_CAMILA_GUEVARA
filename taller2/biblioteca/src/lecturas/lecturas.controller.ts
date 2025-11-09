import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe, ValidationPipe, UsePipes, UseGuards, Query } from '@nestjs/common'
import { LecturasService } from './lecturas.service'
import { CreateLecturaDto } from './dto/create-lectura.dto'
import { UpdateLecturaDto } from './dto/update-lectura.dto'
import { Lectura } from '../entities/lectura.entity'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'

@ApiTags('lecturas')
@Controller('lecturas')
export class LecturasController {
  constructor(private readonly lecturasService: LecturasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las lecturas' })
  async findAll(): Promise<Lectura[]> {
    return this.lecturasService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una lectura por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Lectura | undefined> {
    return this.lecturasService.findOne(id)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Crear una lectura' })
  @ApiResponse({ status: 201, description: 'Lectura creada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  async create(@Body() lectura: CreateLecturaDto): Promise<Lectura>{ 
    return this.lecturasService.create(lectura)
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Actualizar una lectura' })
  @ApiResponse({ status: 200, description: 'Lectura actualizada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() lectura: UpdateLecturaDto): Promise<Lectura | undefined> {
    return this.lecturasService.update(id, lectura)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una lectura' })
  @ApiResponse({ status: 200, description: 'Lectura eliminada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.lecturasService.remove(id)
  }

  // Endpoints administrativos
  @Put(':id/disponible')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar lectura como disponible' })
  @ApiResponse({ status: 200, description: 'Lectura marcada como disponible' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  async marcarDisponible(@Param('id', ParseIntPipe) id: number): Promise<Lectura> {
    return this.lecturasService.marcarDisponible(id)
  }

  @Put(':id/no-disponible')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar lectura como no disponible' })
  @ApiResponse({ status: 200, description: 'Lectura marcada como no disponible' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  async marcarNoDisponible(@Param('id', ParseIntPipe) id: number): Promise<Lectura> {
    return this.lecturasService.marcarNoDisponible(id)
  }

  @Get('filtros/disponibles')
  @ApiOperation({ summary: 'Obtener lecturas disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de lecturas disponibles' })
  async obtenerLecturasDisponibles(): Promise<Lectura[]> {
    return this.lecturasService.obtenerLecturasDisponibles()
  }

  @Get('filtros/no-disponibles')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener lecturas no disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de lecturas no disponibles' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  async obtenerLecturasNoDisponibles(): Promise<Lectura[]> {
    return this.lecturasService.obtenerLecturasNoDisponibles()
  }

  @Get('buscar/titulo')
  @ApiOperation({ summary: 'Buscar lecturas por título' })
  @ApiResponse({ status: 200, description: 'Lista de lecturas encontradas' })
  async buscarPorTitulo(@Query('q') titulo: string): Promise<Lectura[]> {
    return this.lecturasService.buscarPorTitulo(titulo)
  }

  @Get('buscar/autor')
  @ApiOperation({ summary: 'Buscar lecturas por autor' })
  @ApiResponse({ status: 200, description: 'Lista de lecturas encontradas' })
  async buscarPorAutor(@Query('q') autor: string): Promise<Lectura[]> {
    return this.lecturasService.buscarPorAutor(autor)
  }
}