import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe, ValidationPipe, UsePipes, UseGuards } from '@nestjs/common'
import { FormacionesService } from './formaciones.service'
import { Formacion } from '../entities/formacion.entity'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'

@ApiTags('formaciones')
@Controller('formaciones')
export class FormacionesController {
  constructor(private readonly formacionesService: FormacionesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las formaciones' })
  async findAll(): Promise<Formacion[]> {
    return this.formacionesService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una formación por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Formacion | undefined> {
    return this.formacionesService.findOne(id)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Crear una formación' })
  @ApiResponse({ status: 201, description: 'Formación creada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  async create(@Body() formacion: Partial<Formacion>): Promise<Formacion> {
    return this.formacionesService.create(formacion)
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Actualizar una formación' })
  @ApiResponse({ status: 200, description: 'Formación actualizada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 404, description: 'Formación no encontrada' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() formacion: Partial<Formacion>): Promise<Formacion | undefined> {
    return this.formacionesService.update(id, formacion)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una formación' })
  @ApiResponse({ status: 200, description: 'Formación eliminada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 404, description: 'Formación no encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.formacionesService.remove(id)
  }
}