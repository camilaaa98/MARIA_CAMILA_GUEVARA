// orm.cli.config.ts

import { DataSource } from 'typeorm';

// ⚠️ Asegúrate de que estos valores coincidan exactamente con los de tu AppModule.ts
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432, 
  username: 'postgres',
  password: '1947', // Tu contraseña
  database: 'veterinary_clinic', // Tu base de datos
  
  // Rutas necesarias para que el CLI encuentre entidades y migraciones
  entities: [
    __dirname + '/**/*.entity{.ts,.js}', // Busca entidades en todo el proyecto
  ],
  migrations: [
    'src/database/migrations/*.ts', // Define la carpeta de migraciones
  ],
  
  synchronize: false, // ¡Crucial para usar migraciones!
  logging: true,
});