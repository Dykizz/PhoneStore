import { Supplier } from 'src/suppliers/entities/supplier.entity';
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

@Entity('goods_receipts')
export class GoodsReceipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  supplierId: string;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({ type: 'uuid' })
  employeeRecordId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'employeeRecordId' })
  employeeRecord: User;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'int' })
  totalQuantity: number;

  @Column({ type: 'int' })
  totalUniqueProducts: number;

  @Column({ type: 'numeric' })
  totalPrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
