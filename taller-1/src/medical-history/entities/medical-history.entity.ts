import { Appointment } from "../../appointment/entities/appointment.entity";
import { Pet } from "../../pet/entities/pet.entity";
import { User } from "../../user/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity ('medical-history')
export class MedicalHistory {
    @PrimaryGeneratedColumn()
    Id_medicalhistory: number;

    @Column({type: 'date'})
    hist_date: string;

    @Column({type: 'time'})
    hist_time: string;

    @Column()
    hist_diagnosys: string;

    @Column()
    hist_treatment:string;

    @ManyToMany(()=> User, (user)=> user.medicalHistory)
    @JoinTable({
        name: 'usuario_historial', //nombre de la nueva tabla que nace de la renación de muchos a muschos
        joinColumn: {
            name: 'Id_medicalhistory', //Columna Fk en la tabla intermedia
            referencedColumnName: 'Id_medicalhistory',
        },
        inverseJoinColumn:{
            name: 'Id_users', //columna fk en la tabla intermedia que apunta a la entidad User
            referencedColumnName: 'Id_users', //columna de latbala usuaurio para referenciar
        },
    })
    users: User[];

    @Column()
    Id_appo: number;

    @ManyToOne(()=>Appointment, (appointment)=>appointment.medicalHistory)
    @JoinColumn({name: 'Id_appo',
        referencedColumnName: 'Id_appo'
    })
    appointment: Appointment;

    @Column({unique: true})
    Id_pet: number;

    @OneToOne(()=> Pet, (pet)=>pet.medicalHistory)
    @JoinColumn({name: 'Id_pet', 
        referencedColumnName: 'Id_pet'
    })
    pet: Pet;

}