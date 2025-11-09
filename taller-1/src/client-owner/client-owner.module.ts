import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientOwner } from './entities/client-owner.entity';
import { ClientOwnerService } from './client-owner.service';
import { ClientOwnerController } from './client-owner.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClientOwner])],
  providers: [ClientOwnerService],
  controllers: [ClientOwnerController],
})
export class ClientOwnerModule {}
