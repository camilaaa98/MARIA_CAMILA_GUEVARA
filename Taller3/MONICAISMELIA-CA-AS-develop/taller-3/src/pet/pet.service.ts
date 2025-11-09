import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './entities/pet.entity';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { UserRole } from '../auth/enums/user-role.enum';
import { ClientOwner } from '../client-owner/entities/client-owner.entity';

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    @InjectRepository(ClientOwner)
    private readonly clientOwnerRepository: Repository<ClientOwner>,
  ) {}

  async create(createPetDto: CreatePetDto): Promise<Pet> {
    const pet = this.petRepository.create(createPetDto);
    return await this.petRepository.save(pet);
  }

  async findAll(): Promise<Pet[]> {
    return await this.petRepository.find({
      relations: ['client'],
    });
  }

  async findByOwnerEmail(email: string): Promise<Pet[]> {
    const owner = await this.clientOwnerRepository.findOne({ where: { email } });
    if (!owner) {
      return [];
    }
    return await this.petRepository.find({
      where: { Id_client: owner.Id_client },
      relations: ['client'],
    });
  }

  async findOne(id: number, user?: any): Promise<Pet> {
    const pet = await this.petRepository.findOne({
      where: { Id_pet: id },
      relations: ['client'],
    });
    
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }

    // Si es un cliente, solo puede ver sus propias mascotas (comparando por email)
    if (user && user.ID_rol === UserRole.CLIENTE) {
      if (!pet.client || pet.client.email !== user.email) {
        throw new ForbiddenException('You can only access your own pets');
      }
    }

    return pet;
  }

  async update(id: number, updatePetDto: UpdatePetDto): Promise<Pet> {
    await this.petRepository.update(id, updatePetDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.petRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }
  }
}
