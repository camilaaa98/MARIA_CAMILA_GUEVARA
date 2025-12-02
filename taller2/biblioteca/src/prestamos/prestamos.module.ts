import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrestamosController } from './prestamos.controller';
import { PrestamosService } from './prestamos.service';
import { Prestamo } from '../entities/prestamo.entity';
import { Usuario } from '../entities/usuario.entity';
import { Lectura } from '../entities/lectura.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prestamo, Usuario, Lectura])],
  controllers: [PrestamosController],
  providers: [PrestamosService],
  exports: [PrestamosService],
})
export class PrestamosModule {}