import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FichasController } from './fichas.controller'
import { FichasService } from './fichas.service'
import { Ficha } from '../entities/ficha.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Ficha])],
  controllers: [FichasController],
  providers: [FichasService],
})
export class FichasModule {}