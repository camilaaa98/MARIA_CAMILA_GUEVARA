import { Module } from '@nestjs/common';
import { DetabillController } from './detabill.controller';
import { DetabillService } from './detabill.service';

@Module({
  controllers: [DetabillController],
  providers: [DetabillService]
})
export class DetabillModule {}
