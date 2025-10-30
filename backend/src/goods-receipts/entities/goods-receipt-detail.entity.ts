import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GoodsReceipt } from './goods-receipt.entity';
import { Product } from 'src/products/entities/product.entity';
import { VariantProduct } from 'src/products/dto/response-product.dto';

@Entity('goods_receipt_details')
export class GoodsReceiptDetail {
  @PrimaryColumn({ type: 'uuid' })
  goodsReceiptId: string;

  @PrimaryColumn({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'jsonb', nullable: true })
  variants: VariantProduct[];

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'numeric' })
  price: number;

  @ManyToOne(() => GoodsReceipt)
  @JoinColumn({ name: 'goodsReceiptId' })
  goodsReceipt: GoodsReceipt;
}
