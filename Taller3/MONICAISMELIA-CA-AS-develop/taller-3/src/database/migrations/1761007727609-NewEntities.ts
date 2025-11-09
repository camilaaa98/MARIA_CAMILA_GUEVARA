// comando para crear este documento: npx typeorm migration:create ./src/database/migrations/NombreDeLaMigracion
import { MigrationInterface, QueryRunner } from "typeorm";

export class NewEntities1761007727609 implements MigrationInterface {
    name = 'NewEntities1761007727609'

public async up(queryRunner: QueryRunner): Promise<void> {
    // -------------------------------------------------------------------------
    // 1. DROP CONSTRAINTS (Comandos iniciales correctos)
    // -------------------------------------------------------------------------
    await queryRunner.query(`ALTER TABLE "client_owners" DROP CONSTRAINT "FK_af23133ae6922b4df26e7e56513"`);
    await queryRunner.query(`ALTER TABLE "medical_staff" DROP CONSTRAINT "FK_d04dbf03bbcfd3191ec6c42982f"`);
    await queryRunner.query(`ALTER TABLE "medical_staff" DROP CONSTRAINT "FK_d306283329502a9d23e842b6ec4"`);

    // -------------------------------------------------------------------------
    // 2. CREATE TABLES and TYPES
    // -------------------------------------------------------------------------
    await queryRunner.query(`CREATE TABLE "rol" ("id_rol" SERIAL NOT NULL, "rol_nombre" character varying NOT NULL, CONSTRAINT "PK_0b42a30072d57ccfad9949218da" PRIMARY KEY ("id_rol"))`);
    await queryRunner.query(`CREATE TYPE "public"."product-service_type_enum" AS ENUM('PRODUCTO', 'SERVICIO')`);
    await queryRunner.query(`CREATE TABLE "product-service" ("Id_product_service" SERIAL NOT NULL, "prod_name" character varying NOT NULL, "prod_price" numeric(10,2) NOT NULL, "type" "public"."product-service_type_enum" NOT NULL, CONSTRAINT "PK_149e8b6812668cc3d12a2494ad0" PRIMARY KEY ("Id_product_service"))`);
    await queryRunner.query(`CREATE TABLE "detabill" ("Id_detabill" SERIAL NOT NULL, "det_precio" numeric(10,2) NOT NULL, "det_amount" integer NOT NULL, "Id_bill" integer NOT NULL, "Id_product_service" integer NOT NULL, CONSTRAINT "PK_63d3cb00dd819ac924706d84178" PRIMARY KEY ("Id_detabill"))`);
    await queryRunner.query(`CREATE TABLE "bill" ("Id_bill" SERIAL NOT NULL, "fac_date" date NOT NULL, "fac_total" numeric(10,2) NOT NULL, "Id_client" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7baf65ce2be3d8957b7926fbd4d" PRIMARY KEY ("Id_bill"))`);
    await queryRunner.query(`CREATE TABLE "medical-history" ("Id_medicalhistory" SERIAL NOT NULL, "hist_date" date NOT NULL, "hist_time" TIME NOT NULL, "hist_diagnosys" character varying NOT NULL, "hist_treatment" character varying NOT NULL, "Id_appo" integer NOT NULL, "Id_pet" integer NOT NULL, CONSTRAINT "UQ_7e4bdb0f67eab5b10e396eb7abc" UNIQUE ("Id_pet"), CONSTRAINT "REL_7e4bdb0f67eab5b10e396eb7ab" UNIQUE ("Id_pet"), CONSTRAINT "PK_c355dca68ac90538b8a036603a1" PRIMARY KEY ("Id_medicalhistory"))`);
    await queryRunner.query(`CREATE TABLE "usuario_historial" ("Id_medicalhistory" integer NOT NULL, "Id_users" integer NOT NULL, CONSTRAINT "PK_83a46a58971a0533f8276a94690" PRIMARY KEY ("Id_medicalhistory", "Id_users"))`);
    await queryRunner.query(`CREATE INDEX "IDX_49041f0e7e1b3bbb75e9cd2067" ON "usuario_historial" ("Id_medicalhistory") `);
    await queryRunner.query(`CREATE INDEX "IDX_ea176f8e37ae237d78653767ec" ON "usuario_historial" ("Id_users") `);

    // -------------------------------------------------------------------------
    // 3. DROP OLD COLUMNS and PKs (Actualización de tablas existentes)
    // -------------------------------------------------------------------------
    await queryRunner.query(`ALTER TABLE "pets" DROP CONSTRAINT "PK_d01e9e7b4ada753c826720bee8b"`);
    await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "clientId"`);

    await queryRunner.query(`ALTER TABLE "client_owners" DROP CONSTRAINT "PK_af23133ae6922b4df26e7e56513"`);
    await queryRunner.query(`ALTER TABLE "client_owners" DROP COLUMN "clientId"`);

    await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad"`);
    await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "petId"`);

    await queryRunner.query(`ALTER TABLE "specialty" DROP CONSTRAINT "PK_5a8f8f2be485447abde021d7300"`);
    await queryRunner.query(`ALTER TABLE "specialty" DROP COLUMN "id_specialty"`);

    await queryRunner.query(`ALTER TABLE "medical_staff" DROP CONSTRAINT "PK_518263f4f8d7f9cee9df278be36"`);
    await queryRunner.query(`ALTER TABLE "medical_staff" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "medical_staff" DROP CONSTRAINT "UQ_d04dbf03bbcfd3191ec6c42982f"`);
    await queryRunner.query(`ALTER TABLE "medical_staff" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "medical_staff" DROP COLUMN "id_specialty"`);

    await queryRunner.query(`ALTER TABLE "administrative_staff" DROP CONSTRAINT "FK_c390b11b5c6eaeef4941104de49"`);

    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "PK_93695a73812f39e193bc5a73449"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id_users"`);


    // -------------------------------------------------------------------------
    // 4. ADD NEW COLUMNS and PRIMARY KEYs
    // -------------------------------------------------------------------------

    // USERS (Se necesita primero, ya que muchas tablas hacen referencia a ella)
    await queryRunner.query(`ALTER TABLE "users" ADD "Id_users" SERIAL NOT NULL`);
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "PK_99dac768fe2d38129907c115354" PRIMARY KEY ("Id_users")`);

    // PETS
    await queryRunner.query(`ALTER TABLE "pets" ADD "Id_pet" SERIAL NOT NULL`);
    await queryRunner.query(`ALTER TABLE "pets" ADD CONSTRAINT "PK_a5176c475890330253aba488885" PRIMARY KEY ("Id_pet")`);
    await queryRunner.query(`ALTER TABLE "pets" ADD "Id_client" integer NOT NULL`);

    // CLIENT_OWNERS
    await queryRunner.query(`ALTER TABLE "client_owners" ADD "Id_client" SERIAL NOT NULL`);
    await queryRunner.query(`ALTER TABLE "client_owners" ADD CONSTRAINT "PK_e39cb1ade0cc35b08288c845f02" PRIMARY KEY ("Id_client")`);
    await queryRunner.query(`ALTER TABLE "client_owners" ADD "id_rol" integer`);

    // SPECIALTY
    await queryRunner.query(`ALTER TABLE "specialty" ADD "Id_specialty" SERIAL NOT NULL`);
    await queryRunner.query(`ALTER TABLE "specialty" ADD CONSTRAINT "PK_d25c8634a9815b4978ae7b48eee" PRIMARY KEY ("Id_specialty")`);

    // APPOINTMENTS
    await queryRunner.query(`ALTER TABLE "appointments" ADD "Id_appo" SERIAL NOT NULL`);
    await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "PK_dcf9f4be02f2b5ab8d51df8e06d" PRIMARY KEY ("Id_appo")`);
    await queryRunner.query(`CREATE TYPE "public"."appointments_status_enum" AS ENUM('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'REALIZADA', 'NO_ASISTIO')`);
    await queryRunner.query(`ALTER TABLE "appointments" ADD "status" "public"."appointments_status_enum" NOT NULL DEFAULT 'PENDIENTE'`);
    await queryRunner.query(`ALTER TABLE "appointments" ADD "Id_bill" integer`);
    await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "UQ_d69765ba58fc0ca802ff03600d3" UNIQUE ("Id_bill")`);
    await queryRunner.query(`ALTER TABLE "appointments" ADD "Id_pet" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "appointments" ADD "Id_users" integer NOT NULL`);

    // MEDICAL_STAFF 
    await queryRunner.query(`ALTER TABLE "medical_staff" ADD "Id_users" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "medical_staff" ADD CONSTRAINT "PK_a03927af08ecaf55d36a9fc4804" PRIMARY KEY ("Id_users")`);
    await queryRunner.query(`ALTER TABLE "medical_staff" ADD "Id_specialty" integer NOT NULL`);

    // -------------------------------------------------------------------------
    // 5. ADD FOREIGN KEYs (FKs)
    // -------------------------------------------------------------------------
    await queryRunner.query(`ALTER TABLE "pets" ADD CONSTRAINT "FK_be9608ad5061d748b9b23ea468f" FOREIGN KEY ("Id_client") REFERENCES "client_owners"("Id_client") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "client_owners" ADD CONSTRAINT "FK_eebd23ad8d897441f92aee84426" FOREIGN KEY ("id_rol") REFERENCES "rol"("id_rol") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "detabill" ADD CONSTRAINT "FK_d11008213867f0861989c3acd43" FOREIGN KEY ("Id_bill") REFERENCES "bill"("Id_bill") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "detabill" ADD CONSTRAINT "FK_69fd500de0173e4fc5190939d6f" FOREIGN KEY ("Id_product_service") REFERENCES "product-service"("Id_product_service") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "bill" ADD CONSTRAINT "FK_16a88f480f5c471a794d2042dd4" FOREIGN KEY ("Id_client") REFERENCES "client_owners"("Id_client") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_d69765ba58fc0ca802ff03600d3" FOREIGN KEY ("Id_bill") REFERENCES "bill"("Id_bill") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_3f0876e05ef45577c1a23c37d85" FOREIGN KEY ("Id_pet") REFERENCES "pets"("Id_pet") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_43ce2ba6977d0102800d5f61e34" FOREIGN KEY ("Id_users") REFERENCES "users"("Id_users") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "medical-history" ADD CONSTRAINT "FK_f48384d4fa52b999615f792f149" FOREIGN KEY ("Id_appo") REFERENCES "appointments"("Id_appo") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "medical-history" ADD CONSTRAINT "FK_7e4bdb0f67eab5b10e396eb7abc" FOREIGN KEY ("Id_pet") REFERENCES "pets"("Id_pet") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "medical_staff" ADD CONSTRAINT "FK_a03927af08ecaf55d36a9fc4804" FOREIGN KEY ("Id_users") REFERENCES "users"("Id_users") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "medical_staff" ADD CONSTRAINT "FK_51531ebe922def56d0aedbbbc44" FOREIGN KEY ("Id_specialty") REFERENCES "specialty"("Id_specialty") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "usuario_historial" ADD CONSTRAINT "FK_49041f0e7e1b3bbb75e9cd2067e" FOREIGN KEY ("Id_medicalhistory") REFERENCES "medical-history"("Id_medicalhistory") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "usuario_historial" ADD CONSTRAINT "FK_ea176f8e37ae237d78653767ec9" FOREIGN KEY ("Id_users") REFERENCES "users"("Id_users") ON DELETE NO ACTION ON UPDATE NO ACTION`);
}

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuario_historial" DROP CONSTRAINT "FK_ea176f8e37ae237d78653767ec9"`);
        await queryRunner.query(`ALTER TABLE "usuario_historial" DROP CONSTRAINT "FK_49041f0e7e1b3bbb75e9cd2067e"`);
        await queryRunner.query(`ALTER TABLE "client_owners" DROP CONSTRAINT "FK_af23133ae6922b4df26e7e56513"`);
        await queryRunner.query(`ALTER TABLE "medical_staff" DROP CONSTRAINT "FK_d306283329502a9d23e842b6ec4"`);
        await queryRunner.query(`ALTER TABLE "medical_staff" DROP CONSTRAINT "FK_d04dbf03bbcfd3191ec6c42982f"`);
        await queryRunner.query(`ALTER TABLE "medical_staff" DROP CONSTRAINT "FK_51531ebe922def56d0aedbbbc44"`);
        await queryRunner.query(`ALTER TABLE "medical_staff" DROP CONSTRAINT "FK_a03927af08ecaf55d36a9fc4804"`);
        await queryRunner.query(`ALTER TABLE "medical-history" DROP CONSTRAINT "FK_7e4bdb0f67eab5b10e396eb7abc"`);
        await queryRunner.query(`ALTER TABLE "medical-history" DROP CONSTRAINT "FK_f48384d4fa52b999615f792f149"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_43ce2ba6977d0102800d5f61e34"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_3f0876e05ef45577c1a23c37d85"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_d69765ba58fc0ca802ff03600d3"`);
        await queryRunner.query(`ALTER TABLE "bill" DROP CONSTRAINT "FK_16a88f480f5c471a794d2042dd4"`);
        await queryRunner.query(`ALTER TABLE "detabill" DROP CONSTRAINT "FK_69fd500de0173e4fc5190939d6f"`);
        await queryRunner.query(`ALTER TABLE "detabill" DROP CONSTRAINT "FK_d11008213867f0861989c3acd43"`);
        await queryRunner.query(`ALTER TABLE "client_owners" DROP CONSTRAINT "FK_eebd23ad8d897441f92aee84426"`);
        await queryRunner.query(`ALTER TABLE "pets" DROP CONSTRAINT "FK_be9608ad5061d748b9b23ea468f"`);
        await queryRunner.query(`ALTER TABLE "client_owners" DROP CONSTRAINT "PK_bd9255c53b50f73ce188123486a"`);
        await queryRunner.query(`ALTER TABLE "client_owners" ADD CONSTRAINT "PK_e39cb1ade0cc35b08288c845f02" PRIMARY KEY ("Id_client")`);
        await queryRunner.query(`ALTER TABLE "client_owners" DROP COLUMN "clientId"`);
        await queryRunner.query(`ALTER TABLE "medical_staff" DROP COLUMN "id_specialty"`);
        await queryRunner.query(`ALTER TABLE "medical_staff" DROP CONSTRAINT "UQ_d04dbf03bbcfd3191ec6c42982f"`);
        await queryRunner.query(`ALTER TABLE "medical_staff" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "medical_staff" DROP CONSTRAINT "PK_d91c8d6236f518cd2e4129602bb"`);
        await queryRunner.query(`ALTER TABLE "medical_staff" ADD CONSTRAINT "PK_a03927af08ecaf55d36a9fc4804" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "medical_staff" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "petId"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "PK_2e4b7af32f871e469e1cee574a7"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "PK_dcf9f4be02f2b5ab8d51df8e06d" PRIMARY KEY ("Id_appo")`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "clientId"`);
        await queryRunner.query(`ALTER TABLE "pets" DROP CONSTRAINT "PK_e81ce93ef438269b64193cc32fe"`);
        await queryRunner.query(`ALTER TABLE "pets" ADD CONSTRAINT "PK_a5176c475890330253aba488885" PRIMARY KEY ("Id_pet")`);
        await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "specialty" DROP CONSTRAINT "PK_d25c8634a9815b4978ae7b48eee"`);
        await queryRunner.query(`ALTER TABLE "specialty" ADD CONSTRAINT "PK_e66e594891fd8c930ef7d921aff" PRIMARY KEY ("Id_specialty")`);
        await queryRunner.query(`ALTER TABLE "specialty" DROP COLUMN "id_specialty"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "PK_f29143dbfaabc2317eb33fb4220"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "PK_99dac768fe2d38129907c115354" PRIMARY KEY ("Id_users")`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id_users"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "PK_99dac768fe2d38129907c115354"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "Id_users"`);
        await queryRunner.query(`ALTER TABLE "medical_staff" DROP COLUMN "Id_specialty"`);
        await queryRunner.query(`ALTER TABLE "medical_staff" DROP CONSTRAINT "PK_a03927af08ecaf55d36a9fc4804"`);
        await queryRunner.query(`ALTER TABLE "medical_staff" DROP COLUMN "Id_users"`);
        await queryRunner.query(`ALTER TABLE "specialty" DROP CONSTRAINT "PK_e66e594891fd8c930ef7d921aff"`);
        await queryRunner.query(`ALTER TABLE "specialty" DROP COLUMN "Id_specialty"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "Id_users"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "Id_pet"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "UQ_d69765ba58fc0ca802ff03600d3"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "Id_bill"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."appointments_status_enum"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "PK_dcf9f4be02f2b5ab8d51df8e06d"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "Id_appo"`);
        await queryRunner.query(`ALTER TABLE "client_owners" DROP COLUMN "id_rol"`);
        await queryRunner.query(`ALTER TABLE "client_owners" DROP CONSTRAINT "PK_e39cb1ade0cc35b08288c845f02"`);
        await queryRunner.query(`ALTER TABLE "client_owners" DROP COLUMN "Id_client"`);
        await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "Id_client"`);
        await queryRunner.query(`ALTER TABLE "pets" DROP CONSTRAINT "PK_a5176c475890330253aba488885"`);
        await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "Id_pet"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "id_users" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "PK_93695a73812f39e193bc5a73449" PRIMARY KEY ("id_users")`);
        await queryRunner.query(`ALTER TABLE "medical_staff" ADD "id_specialty" integer`);
        await queryRunner.query(`ALTER TABLE "medical_staff" ADD "userId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "medical_staff" ADD CONSTRAINT "UQ_d04dbf03bbcfd3191ec6c42982f" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "medical_staff" ADD "id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "medical_staff" ADD CONSTRAINT "PK_518263f4f8d7f9cee9df278be36" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "specialty" ADD CONSTRAINT "PK_5a8f8f2be485447abde021d7300" PRIMARY KEY ("id_specialty")`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "petId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "userId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "client_owners" ADD "clientId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "client_owners" ADD CONSTRAINT "PK_af23133ae6922b4df26e7e56513" PRIMARY KEY ("clientId")`);
        await queryRunner.query(`ALTER TABLE "pets" ADD "clientId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pets" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pets" ADD CONSTRAINT "PK_d01e9e7b4ada753c826720bee8b" PRIMARY KEY ("id")`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ea176f8e37ae237d78653767ec"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_49041f0e7e1b3bbb75e9cd2067"`);
        await queryRunner.query(`DROP TABLE "usuario_historial"`);
        await queryRunner.query(`DROP TABLE "medical-history"`);
        await queryRunner.query(`DROP TABLE "bill"`);
        await queryRunner.query(`DROP TABLE "detabill"`);
        await queryRunner.query(`DROP TABLE "product-service"`);
        await queryRunner.query(`DROP TYPE "public"."product-service_type_enum"`);
        await queryRunner.query(`DROP TABLE "rol"`);
        await queryRunner.query(`ALTER SEQUENCE "specialty_id_specialty_seq" RENAME TO "specialty_Id_specialty_seq"`);
        await queryRunner.query(`ALTER TABLE "specialty" RENAME CONSTRAINT "PK_5a8f8f2be485447abde021d7300" TO "PK_e66e594891fd8c930ef7d921aff"`);
        await queryRunner.query(`ALTER TABLE "specialty" RENAME COLUMN "id_specialty" TO "Id_specialty"`);
        await queryRunner.query(`ALTER SEQUENCE "users_id_users_seq" RENAME TO "users_Id_users_seq"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME CONSTRAINT "PK_93695a73812f39e193bc5a73449" TO "PK_99dac768fe2d38129907c115354"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "id_users" TO "Id_users"`);
        await queryRunner.query(`ALTER SEQUENCE "users_Id_users_seq" RENAME TO "users_id_users_seq"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME CONSTRAINT "PK_99dac768fe2d38129907c115354" TO "PK_93695a73812f39e193bc5a73449"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "Id_users" TO "id_users"`);
        await queryRunner.query(`ALTER SEQUENCE "specialty_Id_specialty_seq" RENAME TO "specialty_id_specialty_seq"`);
        await queryRunner.query(`ALTER TABLE "specialty" RENAME CONSTRAINT "PK_e66e594891fd8c930ef7d921aff" TO "PK_5a8f8f2be485447abde021d7300"`);
        await queryRunner.query(`ALTER TABLE "specialty" RENAME COLUMN "Id_specialty" TO "id_specialty"`);

        await queryRunner.query(`ALTER TABLE "client_owners" ADD CONSTRAINT "FK_af23133ae6922b4df26e7e56513" FOREIGN KEY ("clientId") REFERENCES "client_owners"("clientId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
