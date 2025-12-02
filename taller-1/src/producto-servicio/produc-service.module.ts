import { Module } from '@nestjs/common';
import { ProductService} from './product-service.controller';
import { ProductoServicioService } from './produc-service.service';

@Module({
  controllers: [ProductService],
  providers: [ProductoServicioService]
})
export class ProductoServicioModule {}
