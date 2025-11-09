import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

// Importar entidades
import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../entities/rol.entity';
import { Ficha } from '../entities/ficha.entity';
import { Formacion } from '../entities/formacion.entity';
import { Categoria } from '../entities/categoria.entity';
import { Lectura } from '../entities/lectura.entity';

@Injectable()
export class DatabaseSeeder {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
    @InjectRepository(Ficha)
    private fichaRepository: Repository<Ficha>,
    @InjectRepository(Formacion)
    private formacionRepository: Repository<Formacion>,
    @InjectRepository(Categoria)
    private categoriaRepository: Repository<Categoria>,
    @InjectRepository(Lectura)
    private lecturaRepository: Repository<Lectura>,
  ) {}

  async seed(): Promise<void> {
    console.log('🌱 Iniciando seeding de la base de datos...');

    // Verificar si ya hay datos
    const userCount = await this.usuarioRepository.count();
    if (userCount > 0) {
      console.log('✅ La base de datos ya tiene datos. Ejecutando actualización mínima (roles, formaciones, fichas).');
      try {
        await this.seedRoles();
        await this.seedFormaciones();
        await this.seedFichas();
        console.log('✅ Actualización mínima completada.');
      } catch (error) {
        console.error('❌ Error durante la actualización mínima:', error);
        throw error;
      }
      return;
    }

    try {
      // 1. Crear roles
      await this.seedRoles();
      
      // 2. Crear formaciones
      await this.seedFormaciones();
      
      // 3. Crear fichas
      await this.seedFichas();
      
      // 4. Crear usuarios
      await this.seedUsuarios();
      
      // 5. Crear categorías
      await this.seedCategorias();
      
      // 6. Crear lecturas (libros)
      await this.seedLecturas();

      console.log('✅ Seeding completado exitosamente!');
    } catch (error) {
      console.error('❌ Error durante el seeding:', error);
      throw error;
    }
  }

  private async seedRoles(): Promise<void> {
    console.log('📝 Creando roles...');
    
    const roles = [
      { id: 1, nombre: 'Administrador', descripcion: 'Administrador del sistema' },
      { id: 2, nombre: 'Aprendiz', descripcion: 'Estudiante aprendiz del SENA' },
      { id: 3, nombre: 'Instructor', descripcion: 'Instructor del SENA' },
      { id: 4, nombre: 'Personal Externo', descripcion: 'Personal externo del SENA' }
    ];

    for (const rolData of roles) {
      await this.rolRepository.upsert(rolData, ['id']);
    }
  }

  private async seedFormaciones(): Promise<void> {
    console.log('📚 Creando formaciones...');
    
    const formaciones = [
      { id: 1, nombre: 'Tecnología en Análisis y Desarrollo de Software', descripcion: 'Formación técnica en desarrollo de software', duracion: 24 },
      { id: 2, nombre: 'Tecnología en Sistemas', descripcion: 'Formación técnica en sistemas informáticos', duracion: 24 },
      { id: 3, nombre: 'Tecnología en Redes de Computadores', descripcion: 'Formación técnica en redes y telecomunicaciones', duracion: 24 }
    ];

    for (const formacionData of formaciones) {
      await this.formacionRepository.upsert(formacionData, ['id']);
    }
  }

  private async seedFichas(): Promise<void> {
    console.log('📋 Creando fichas...');
    
    const fichas = [
      { id: 1, codigo: '3313178', formacionId: 1, fechaInicio: new Date('2024-01-15'), fechaFin: new Date('2025-12-15') }, // El Doncello
      { id: 2, codigo: '2859636', formacionId: 2, fechaInicio: new Date('2024-02-01'), fechaFin: new Date('2026-01-31') }, // San Vicente del Caguán
      { id: 3, codigo: '3002217', formacionId: 3, fechaInicio: new Date('2024-03-01'), fechaFin: new Date('2026-02-28') }  // Florencia
    ];

    for (const fichaData of fichas) {
      await this.fichaRepository.upsert(fichaData, ['id']);
    }
  }

  private async seedUsuarios(): Promise<void> {
    console.log('👥 Creando usuarios...');
    
    const usuarios = [
      {
        id: 1,
        nombre: 'Paulina',
        apellido: 'Polanco',
        email: 'puli@sena.edu.co',
        password: await bcrypt.hash('123456', 10),
        rolId: 1, // Administrador
        fichaId: null
      },
      {
        id: 2,
        nombre: 'Paula',
        apellido: 'Cortes',
        email: 'cortesp@sena.edu.co',
        password: await bcrypt.hash('123456', 10),
        rolId: 2, // Aprendiz
        fichaId: 1
      }
    ];

    for (const usuarioData of usuarios) {
      const usuario = this.usuarioRepository.create(usuarioData);
      await this.usuarioRepository.save(usuario);
    }
  }

  private async seedCategorias(): Promise<void> {
    console.log('📂 Creando categorías...');
    
    const categorias = [
      { id: 1, nombre: 'Programación', descripcion: 'Libros sobre lenguajes de programación y desarrollo de software' },
      { id: 2, nombre: 'Base de Datos', descripcion: 'Libros sobre diseño y administración de bases de datos' },
      { id: 3, nombre: 'Redes', descripcion: 'Libros sobre redes de computadores y telecomunicaciones' },
      { id: 4, nombre: 'Sistemas Operativos', descripcion: 'Libros sobre sistemas operativos y administración de sistemas' }
    ];

    for (const categoriaData of categorias) {
      const categoria = this.categoriaRepository.create(categoriaData);
      await this.categoriaRepository.save(categoria);
    }
  }

  private async seedLecturas(): Promise<void> {
    console.log('📖 Creando lecturas (libros)...');
    
    const lecturas = [
      {
        titulo: 'Fundamentos de Programación',
        autor: 'SENA',
        fechaPublicacion: new Date('2023-01-14'),
        editorial: 'Editorial SENA',
        disponible: true,
        categoriaId: 1 // Programación
      },
      {
        titulo: 'Desarrollo Web con JavaScript',
        autor: 'María González',
        fechaPublicacion: new Date('2023-03-19'),
        editorial: 'TechBooks',
        disponible: false,
        categoriaId: 1 // Programación
      },
      {
        titulo: 'Python para Principiantes',
        autor: 'Carlos Mendoza',
        fechaPublicacion: new Date('2023-02-10'),
        editorial: 'CodePress',
        disponible: true,
        categoriaId: 1 // Programación
      },
      {
        titulo: 'Java Avanzado',
        autor: 'Ana Rodríguez',
        fechaPublicacion: new Date('2023-04-05'),
        editorial: 'JavaWorld',
        disponible: true,
        categoriaId: 1 // Programación
      },
      {
        titulo: 'React y Node.js',
        autor: 'Luis García',
        fechaPublicacion: new Date('2023-05-15'),
        editorial: 'WebDev Books',
        disponible: false,
        categoriaId: 1 // Programación
      },
      {
        titulo: 'Algoritmos y Estructuras de Datos',
        autor: 'SENA',
        fechaPublicacion: new Date('2023-01-20'),
        editorial: 'Editorial SENA',
        disponible: true,
        categoriaId: 1 // Programación
      },
      {
        titulo: 'MySQL Completo',
        autor: 'Roberto Silva',
        fechaPublicacion: new Date('2023-03-25'),
        editorial: 'Database Pro',
        disponible: true,
        categoriaId: 2 // Base de Datos
      },
      {
        titulo: 'Redes de Computadores',
        autor: 'SENA',
        fechaPublicacion: new Date('2023-02-28'),
        editorial: 'Editorial SENA',
        disponible: true,
        categoriaId: 3 // Redes
      }
    ];

    for (const lecturaData of lecturas) {
      const lectura = this.lecturaRepository.create(lecturaData);
      await this.lecturaRepository.save(lectura);
    }
  }
}
