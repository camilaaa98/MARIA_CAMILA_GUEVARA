import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LecturasModule } from './lecturas/lecturas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CategoriasModule } from './categorias/categorias.module';
import { FormacionesModule } from './formaciones/formaciones.module';
import { FichasModule } from './fichas/fichas.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { PrestamosModule } from './prestamos/prestamos.module';
import { DatabaseSeeder } from './config/database.seeder';

// Importar entidades
import { Lectura } from './entities/lectura.entity';
import { Usuario } from './entities/usuario.entity';
import { Categoria } from './entities/categoria.entity';
import { Formacion } from './entities/formacion.entity';
import { Ficha } from './entities/ficha.entity';
import { Rol } from './entities/rol.entity';
import { Prestamo } from './entities/prestamo.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'bibliosena.db',
      entities: [Lectura, Usuario, Categoria, Formacion, Ficha, Rol, Prestamo],
      synchronize: true, // Solo para desarrollo - crea tablas automáticamente
      logging: true,
      }),
      TypeOrmModule.forFeature([Usuario, Rol, Ficha, Formacion, Categoria, Lectura, Prestamo]),
      LecturasModule,
    UsuariosModule,
    CategoriasModule,
    FormacionesModule,
    FichasModule,
    RolesModule,
    AuthModule,
    PrestamosModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseSeeder],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly databaseSeeder: DatabaseSeeder) {}

  async onModuleInit() {
    // Ejecutar seeding al inicializar la aplicación
    await this.databaseSeeder.seed();
  }
}
