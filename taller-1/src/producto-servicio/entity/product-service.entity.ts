import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductoServiceType } from "../enum/productserviceType";
import { DetaBill } from "../../detabill/entities/detabill.entity";

@Entity ('product-service')
export class ProductService{

    @PrimaryGeneratedColumn()
    Id_product_service: number;

    @Column()
    prod_name: string;

    @Column({type: 'decimal', precision: 10, scale: 2})
    prod_price: number;

    @Column({
        type: 'enum',
        enum: ProductoServiceType,
        name: 'type'
    }
    )
    prod_type: ProductoServiceType

    @OneToMany(()=> DetaBill, (detabill)=>detabill.productservice)
    detabill: DetaBill[];

}