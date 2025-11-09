import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe, ValidationPipe, UsePipes, UseGuards } from '@nestjs/common';
import { PrestamosService } from './prestamos.service';
import { Prestamo } from '../entities/prestamo.entity';
import { CreatePrestamoDto } from './dto/create-prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('prestamos')
@Controller('prestamos')
export class PrestamosController {
  constructor(private readonly prestamosService: PrestamosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los préstamos' })
  async findAll(): Promise<Prestamo[]> {
    return this.prestamosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un préstamo por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Prestamo> {
    return this.prestamosService.findOne(id);
  }

  @Get('usuario/:usuarioId')
  @ApiOperation({ summary: 'Obtener préstamos de un usuario específico' })
  async findByUsuario(@Param('usuarioId', ParseIntPipe) usuarioId: number): Promise<Prestamo[]> {
    return this.prestamosService.findByUsuario(usuarioId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Crear un nuevo préstamo' })
  @ApiResponse({ status: 201, description: 'Préstamo creado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o restricciones no cumplidas' })
  async create(@Body() createPrestamoDto: CreatePrestamoDto): Promise<Prestamo> {
    return this.prestamosService.create(createPrestamoDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Actualizar un préstamo' })
  @ApiResponse({ status: 200, description: 'Préstamo actualizado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 404, description: 'Préstamo no encontrado' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updatePrestamoDto: UpdatePrestamoDto): Promise<Prestamo> {
    return this.prestamosService.update(id, updatePrestamoDto);
  }

  @Put(':id/renovar')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Renovar un préstamo' })
  @ApiResponse({ status: 200, description: 'Préstamo renovado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 400, description: 'No se puede renovar el préstamo' })
  async renovar(@Param('id', ParseIntPipe) id: number): Promise<Prestamo> {
    return this.prestamosService.renovarPrestamo(id);
  }

  @Put(':id/devolver')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar un préstamo como devuelto' })
  @ApiResponse({ status: 200, description: 'Préstamo marcado como devuelto' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  async devolver(@Param('id', ParseIntPipe) id: number): Promise<Prestamo> {
    return this.prestamosService.update(id, { estado: 'devuelto' });
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un préstamo' })
  @ApiResponse({ status: 200, description: 'Préstamo eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 404, description: 'Préstamo no encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.prestamosService.remove(id);
  }

  @Post('marcar-vencidos')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar préstamos vencidos (tarea administrativa)' })
  @ApiResponse({ status: 200, description: 'Préstamos vencidos marcados exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  async marcarVencidos(): Promise<{ message: string }> {
    await this.prestamosService.marcarVencidos();
    return { message: 'Préstamos vencidos marcados exitosamente' };
  }
}