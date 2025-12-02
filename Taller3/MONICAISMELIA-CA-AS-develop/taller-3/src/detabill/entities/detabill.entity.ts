import { Bill } from "../../bill/entity/bill.entity";
import { ProductService } from "../../producto-servicio/entity/product-service.entity";
import {Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity ('detabill')
export class DetaBill{
    @PrimaryGeneratedColumn()
    Id_detabill: number;

    @Column({type: 'decimal', precision: 10, scale: 2})
    det_precio: number;

    @Column({type: 'int'})
    det_amount: number;

    @Column() 
    Id_bill: number;

    @ManyToOne(()=> Bill, (bill)=>bill.detabill)
    @JoinColumn({name:'Id_bill',
        referencedColumnName: 'Id_bill' //para referenciar el campo Id de la tabla factura
    })
    bill: Bill;

    @Column() 
    Id_product_service: number;

    @ManyToOne(()=> ProductService, (producservice)=> producservice.detabill)
    @JoinColumn({name: 'Id_product_service', 
        referencedColumnName: 'Id_product_service' //para referenciar el campo Id de la tabla producto servicio
    })
    productservice: ProductService;

}