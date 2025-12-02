import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe, ValidationPipe, UsePipes, UseGuards } from '@nestjs/common'
import { UsuariosService } from './usuarios.service'
import { Usuario } from '../entities/usuario.entity'
import { CreateUsuarioDto } from './dto/create-usuario.dto'
import { UpdateUsuarioDto } from './dto/update-usuario.dto'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'

@ApiTags('usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  async findAll(): Promise<Usuario[]> {
    return this.usuariosService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Usuario | undefined> {
    return this.usuariosService.findOne(id)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Crear un usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  async create(@Body() createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    return this.usuariosService.create(createUsuarioDto)
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    return this.usuariosService.update(id, updateUsuarioDto)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usuariosService.remove(id)
  }

  // Endpoints administrativos
  @Put(':id/activar')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario activado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async activarUsuario(@Param('id', ParseIntPipe) id: number): Promise<Usuario> {
    return this.usuariosService.activarUsuario(id)
  }

  @Put(':id/desactivar')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desactivar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario desactivado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async desactivarUsuario(@Param('id', ParseIntPipe) id: number): Promise<Usuario> {
    return this.usuariosService.desactivarUsuario(id)
  }

  @Put(':id/sancionar')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sancionar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario sancionado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async sancionarUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { motivo: string }
  ): Promise<Usuario> {
    return this.usuariosService.sancionarUsuario(id, body.motivo)
  }

  @Put(':id/levantar-sancion')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Levantar sanción de un usuario' })
  @ApiResponse({ status: 200, description: 'Sanción levantada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async levantarSancion(@Param('id', ParseIntPipe) id: number): Promise<Usuario> {
    return this.usuariosService.levantarSancion(id)
  }

  @Put(':id/observacion')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Agregar observación a un usuario' })
  @ApiResponse({ status: 200, description: 'Observación agregada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async agregarObservacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { observacion: string }
  ): Promise<Usuario> {
    return this.usuariosService.agregarObservacion(id, body.observacion)
  }

  @Get('filtros/activos')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuarios activos' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios activos' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  async obtenerUsuariosActivos(): Promise<Usuario[]> {
    return this.usuariosService.obtenerUsuariosActivos()
  }

  @Get('filtros/sancionados')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuarios sancionados' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios sancionados' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token requerido' })
  async obtenerUsuariosSancionados(): Promise<Usuario[]> {
    return this.usuariosService.obtenerUsuariosSancionados()
  }
}