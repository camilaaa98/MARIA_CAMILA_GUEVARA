import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe, ValidationPipe, UsePipes, UseGuards } from '@nestjs/common'
import { CategoriasService } from './categorias.service'
import { CreateCategoriaDto } from './dto/create-categoria.dto'
import { UpdateCategoriaDto } from './dto/update-categoria.dto'
import { Categoria } from '../entities/categoria.entity'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'

@ApiTags('categorias')
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las categorías' })
  async findAll(): Promise<Categoria[]> {
    return this.categoriasService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Categoria | undefined> {
    return this.categoriasService.findOne(id)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Crear una categoría' })
  @ApiResponse({ status: 201, description: 'Categoría creada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  async create(@Body() categoria: CreateCategoriaDto): Promise<Categoria> {
    return this.categoriasService.create(categoria)
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Actualizar una categoría' })
  @ApiResponse({ status: 200, description: 'Categoría actualizada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() categoria: UpdateCategoriaDto): Promise<Categoria | undefined> {
    return this.categoriasService.update(id, categoria)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una categoría' })
  @ApiResponse({ status: 200, description: 'Categoría eliminada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.categoriasService.remove(id)
  }
}