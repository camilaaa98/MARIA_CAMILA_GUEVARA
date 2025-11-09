import { MedicalStaff } from "../../medical-staff/entities/medical-staff.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity ('specialty')
export class Specialty {
    @PrimaryGeneratedColumn()
    Id_specialty: number;

    @Column()
    specialty_name: string;

    @OneToMany(()=> MedicalStaff, (medicalstaff)=>medicalstaff.specialty)
    medicalstaff: MedicalStaff[];
}