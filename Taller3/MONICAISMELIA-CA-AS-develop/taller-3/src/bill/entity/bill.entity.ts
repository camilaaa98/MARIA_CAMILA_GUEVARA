
import { Appointment } from "../../appointment/entities/appointment.entity";
import { ClientOwner } from "../../client-owner/entities/client-owner.entity";
import { DetaBill } from "../../detabill/entities/detabill.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity ('bill')
export class Bill{

    @PrimaryGeneratedColumn()
    Id_bill: number;

    @Column({type: 'date'})
    fac_date: string;

    @Column({type: 'decimal', precision: 10, scale: 2})
    fac_total: number;

    @Column()
    Id_client: number;

    @ManyToOne(()=> ClientOwner, (clientOwner) =>clientOwner.bills )
    @JoinColumn({name: 'Id_client',
        referencedColumnName: 'Id_client'
    })
    client: ClientOwner;

    @OneToOne(()=> Appointment, (appointment)=> appointment.bill)
    appointment: Appointment;

    @OneToMany(()=> DetaBill, (detabill)=>detabill.bill)
    detabill: DetaBill[];

    @CreateDateColumn({name: 'created_at'})
    createdAt: Date;

}