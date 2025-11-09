import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe, ValidationPipe, UsePipes, UseGuards } from '@nestjs/common'
import { FichasService } from './fichas.service'
import { Ficha } from '../entities/ficha.entity'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'

@ApiTags('fichas')
@Controller('fichas')
export class FichasController {
  constructor(private readonly fichasService: FichasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las fichas' })
  async findAll(): Promise<Ficha[]> {
    return this.fichasService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una ficha por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Ficha | undefined> {
    return this.fichasService.findOne(id)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Crear una ficha' })
  @ApiResponse({ status: 201, description: 'Ficha creada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  async create(@Body() ficha: Partial<Ficha>): Promise<Ficha> {
    return this.fichasService.create(ficha)
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Actualizar una ficha' })
  @ApiResponse({ status: 200, description: 'Ficha actualizada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 404, description: 'Ficha no encontrada' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() ficha: Partial<Ficha>): Promise<Ficha | undefined> {
    return this.fichasService.update(id, ficha)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una ficha' })
  @ApiResponse({ status: 200, description: 'Ficha eliminada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 404, description: 'Ficha no encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.fichasService.remove(id)
  }
}