# 🐾 Taller 3 - Clínica Veterinaria (Backend - NestJS)

Este repositorio contiene la implementación del **backend** para el Taller #3   con  base  en  Clínica Veterinaria 

## 👩‍💻 Integrantes del grupo

- **María Camila Guevara Ramírez**: Seguridad + Documentación  
- **Mónica Ismelia Cañas Reyes**: CRUD + Entidades  
- **Dajarthy Yenerys Hernández Cuéllar**: Diagrama, Base de Datos y Relaciones

---

## 🛠️ Tecnologías utilizadas

- **Framework**: [NestJS](https://nestjs.com/)
- **Base de datos**: PostgreSQL
- **ORM**: TypeORM
- **Validación**: class-validator
- **Seguridad**

---


    /*comandos para la migración de las tablas al motor de gestión*/
    "typeorm": "ts-node ./node_modules/typeorm/cli.js -d ./orm.cli.config.ts",
    "migration:generate": "npm run typeorm -- migration:generate src/database/migrations/NewEntities", /*crea el archivo de migración*/ 
    "migration:run": "npm run typeorm -- migration:run", /*comando para ejecutar la migración*/
    "migration:revert": "npm run typeorm -- migration:revert" /*comando para deshacer la ultima migración*/


