import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { AdministrativeStaffService } from './administrative-staff.service';
import { CreateAdministrativeStaffDto } from './dto/create-administrative-staff.dto';
import { UpdateAdministrativeStaffDto } from './dto/update-administrative-staff.dto';

@Controller('administrative-staff')
export class AdministrativeStaffController {
  constructor(private readonly adminStaffService: AdministrativeStaffService) {}

  @Post()
  create(@Body() createDto: CreateAdministrativeStaffDto) {
    return this.adminStaffService.create(createDto);
  }

  @Get()
  findAll() {
    return this.adminStaffService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminStaffService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateAdministrativeStaffDto) {
    return this.adminStaffService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminStaffService.remove(id);
  }
}
