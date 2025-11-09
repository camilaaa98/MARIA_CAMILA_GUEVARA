import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { ClientOwnerService } from './client-owner.service';
import { CreateClientOwnerDto } from './dto/create-client-owner.dto';
import { UpdateClientOwnerDto } from './dto/update-client-owner.dto';

@Controller('client-owners')
export class ClientOwnerController {
  constructor(private readonly clientOwnerService: ClientOwnerService) {}

  @Post()
  create(@Body() createClientOwnerDto: CreateClientOwnerDto) {
    return this.clientOwnerService.create(createClientOwnerDto);
  }

  @Get()
  findAll() {
    return this.clientOwnerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientOwnerService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateClientOwnerDto: UpdateClientOwnerDto) {
    return this.clientOwnerService.update(id, updateClientOwnerDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientOwnerService.remove(id);
  }
}
