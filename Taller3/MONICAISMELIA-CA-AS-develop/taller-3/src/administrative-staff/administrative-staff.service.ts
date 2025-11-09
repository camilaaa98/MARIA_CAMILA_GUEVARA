import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdministrativeStaff } from './entities/administrative-staff.entity';
import { CreateAdministrativeStaffDto } from './dto/create-administrative-staff.dto';
import { UpdateAdministrativeStaffDto } from './dto/update-administrative-staff.dto';

@Injectable()
export class AdministrativeStaffService {
  constructor(
    @InjectRepository(AdministrativeStaff)
    private readonly adminStaffRepository: Repository<AdministrativeStaff>,
  ) {}

  async create(createDto: CreateAdministrativeStaffDto): Promise<AdministrativeStaff> {
    const staff = this.adminStaffRepository.create(createDto);
    return await this.adminStaffRepository.save(staff);
  }

  async findAll(): Promise<AdministrativeStaff[]> {
    return await this.adminStaffRepository.find();
  }

  async findOne(id: number): Promise<AdministrativeStaff> {
    const staff = await this.adminStaffRepository.findOneBy({ id });
    if (!staff) {
      throw new NotFoundException(`Administrative staff with ID ${id} not found`);
    }
    return staff;
  }

  async update(id: number, updateDto: UpdateAdministrativeStaffDto): Promise<AdministrativeStaff> {
    await this.adminStaffRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.adminStaffRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Administrative staff with ID ${id} not found`);
    }
  }
}
