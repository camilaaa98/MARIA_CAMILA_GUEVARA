import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministrativeStaff } from './entities/administrative-staff.entity';
import { AdministrativeStaffService } from './administrative-staff.service';
import { AdministrativeStaffController } from './administrative-staff.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AdministrativeStaff])],
  providers: [AdministrativeStaffService],
  controllers: [AdministrativeStaffController],
})
export class AdministrativeStaffModule {}
