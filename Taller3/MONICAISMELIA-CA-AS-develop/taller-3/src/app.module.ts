import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { ClientOwnerModule } from './client-owner/client-owner.module';
import { PetModule } from './pet/pet.module';
import { AppointmentModule } from './appointment/appointment.module';
import { AdministrativeStaffModule } from './administrative-staff/administrative-staff.module';
import { MedicalStaffModule } from './medical-staff/medical-staff.module';
import { SpecialtyModule } from './specialty/specialty.module';
import { RolModule } from './rol/rol.module';
import { MedicalHistoryModule } from './medical-history/medical-history.module';
import { BillModule } from './bill/bill.module';
import { ProductoServicioModule } from './producto-servicio/produc-service.module';
import { DetabillModule } from './detabill/detabill.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '1947',
      database: process.env.DB_DATABASE || 'veterinary_clinic',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
      },
      {
        name: 'login',
        ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
        limit: 10,
      },
    ]),
    AuthModule,
    UserModule,
    ClientOwnerModule,
    PetModule,
    AppointmentModule,
    AdministrativeStaffModule,
    MedicalStaffModule,
    SpecialtyModule,
    RolModule,
    MedicalHistoryModule,
    BillModule,
    ProductoServicioModule,
    DetabillModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
