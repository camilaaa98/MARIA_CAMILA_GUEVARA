import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'biblioteca_sena.db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // Solo para desarrollo, no usar en producción
};