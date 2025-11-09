import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientOwner } from './entities/client-owner.entity';
import { CreateClientOwnerDto } from './dto/create-client-owner.dto';
import { UpdateClientOwnerDto } from './dto/update-client-owner.dto';

@Injectable()
export class ClientOwnerService {
  constructor(
    @InjectRepository(ClientOwner)
    private readonly clientOwnerRepository: Repository<ClientOwner>,
  ) {}

  async create(createClientOwnerDto: CreateClientOwnerDto): Promise<ClientOwner> {
    const clientOwner = this.clientOwnerRepository.create(createClientOwnerDto);
    return await this.clientOwnerRepository.save(clientOwner);
  }

  async findAll(): Promise<ClientOwner[]> {
    return await this.clientOwnerRepository.find();
  }

  async findOne(id: number): Promise<ClientOwner> {
    const clientOwner = await this.clientOwnerRepository.findOneBy({ Id_client: id });
    if (!clientOwner) {
      throw new NotFoundException(`Client owner with ID ${id} not found`);
    }
    return clientOwner;
  }

  async update(id: number, updateClientOwnerDto: UpdateClientOwnerDto): Promise<ClientOwner> {
    await this.clientOwnerRepository.update(id, updateClientOwnerDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.clientOwnerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Client owner with ID ${id} not found`);
    }
  }
}
