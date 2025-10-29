import { Brand } from 'src/brands/entities/brand.entity';
import { DiscountPolicy } from 'src/discount-policies/entities/discount-policy.entity';
import { ProductType } from 'src/product-types/entities/product-type.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  baseDescription: string;

  @Column({ type: 'text', nullable: true })
  detailDescription: string;

  @Column({ type: 'jsonb', nullable: true })
  variants: {
    color: string;
    image: string;
    quantity: number;
  }[];

  @Column('numeric', { default: 0 })
  price: number;

  @Column('boolean', { default: false })
  isReleased: boolean;

  @Column('int', { default: 0 })
  quantity: number;

  @Column('int', { default: 0 })
  quantitySold: number;

  @Column('uuid', { nullable: true })
  discountPolicyId: string;

  @ManyToOne(() => DiscountPolicy, { nullable: true })
  @JoinColumn({ name: 'discountPolicyId' })
  discountPolicy: DiscountPolicy;

  @ManyToOne(() => ProductType, { nullable: true })
  @JoinColumn({ name: 'productTypeId' })
  productType: ProductType;

  @Column('uuid')
  productTypeId: string;

  @ManyToOne(() => Brand, { nullable: true })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @Column('uuid')
  brandId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column('uuid')
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;
}
