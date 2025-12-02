import { Module } from '@nestjs/common';
import { MedicalStaffController } from './medical-staff.controller';
import { MedicalStaffService } from './medical-staff.service';

@Module({
  controllers: [MedicalStaffController],
  providers: [MedicalStaffService]
})
export class MedicalStaffModule {}
