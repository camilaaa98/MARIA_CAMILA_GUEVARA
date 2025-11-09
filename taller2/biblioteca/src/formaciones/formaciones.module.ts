import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormacionesController } from './formaciones.controller';
import { FormacionesService } from './formaciones.service';
import { Formacion } from '../entities/formacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Formacion])],
  controllers: [FormacionesController],
  providers: [FormacionesService],
})
export class FormacionesModule {}