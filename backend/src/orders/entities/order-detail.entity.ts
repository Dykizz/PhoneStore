import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from 'src/products/entities/product.entity';
import { ProductVariant } from 'src/products/entities/product-variant.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';

@Entity('order_details')
export class OrderDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, { eager: false })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'uuid' })
  variantId: string;

  @ManyToOne(() => ProductVariant, { eager: true })
  @JoinColumn({ name: 'variantId' })
  variant: ProductVariant;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'numeric' })
  price: number;

  @Column({ type: 'numeric' })
  itemTotal: number;

  @Column({
    name: 'discount_percent',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  discountPercent: number;

  @Column({ type: 'jsonb' })
  snapshotProdct: {
    brandName: string;
    productName: string;
    variantColor: string;
    variantImage: string;
    prtoductType: string;
  };
}
