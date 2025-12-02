import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe, ValidationPipe, UsePipes, UseGuards } from '@nestjs/common'
import { RolesService } from './roles.service'
import { Rol } from '../entities/rol.entity'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los roles' })
  async findAll(): Promise<Rol[]> {
    return this.rolesService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Rol | undefined> {
    return this.rolesService.findOne(id)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Crear un rol' })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  async create(@Body() rol: Partial<Rol>): Promise<Rol> {
    return this.rolesService.create(rol)
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Actualizar un rol' })
  @ApiResponse({ status: 200, description: 'Rol actualizado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() rol: Partial<Rol>): Promise<Rol | undefined> {
    return this.rolesService.update(id, rol)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un rol' })
  @ApiResponse({ status: 200, description: 'Rol eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.rolesService.remove(id)
  }
}