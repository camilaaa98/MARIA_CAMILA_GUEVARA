import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe, UseGuards, UseInterceptors } from '@nestjs/common';
import { PetService } from './pet.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/enums/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuditLoggingInterceptor } from '../auth/interceptors/audit-logging.interceptor';

@Controller('pets')
@UseGuards(RolesGuard)
@UseInterceptors(AuditLoggingInterceptor)
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.VETERINARIO, UserRole.ASISTENTE)
  create(@Body() createPetDto: CreatePetDto, @CurrentUser() user: any) {
    return this.petService.create(createPetDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.VETERINARIO, UserRole.ASISTENTE, UserRole.CLIENTE)
  findAll(@CurrentUser() user: any) {
    // Los clientes solo pueden ver sus propias mascotas (por email)
    if (user.ID_rol === UserRole.CLIENTE) {
      return this.petService.findByOwnerEmail(user.email);
    }
    return this.petService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.VETERINARIO, UserRole.ASISTENTE, UserRole.CLIENTE)
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.petService.findOne(id, user);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.VETERINARIO, UserRole.ASISTENTE)
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePetDto: UpdatePetDto, @CurrentUser() user: any) {
    return this.petService.update(id, updatePetDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.VETERINARIO)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.petService.remove(id);
  }
}
