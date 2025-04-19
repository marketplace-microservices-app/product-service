import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  product_code: string;

  @Column()
  product_name: string;

  @Column({ length: 100 })
  short_description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  item_price: number;

  @Column('int')
  available_stock: number;

  @Column('uuid')
  seller_id: string;
}
