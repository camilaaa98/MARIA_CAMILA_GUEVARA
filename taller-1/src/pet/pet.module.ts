import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pet } from './entities/pet.entity';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { ClientOwner } from '../client-owner/entities/client-owner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pet, ClientOwner])],
  providers: [PetService],
  controllers: [PetController],
})
export class PetModule {}
