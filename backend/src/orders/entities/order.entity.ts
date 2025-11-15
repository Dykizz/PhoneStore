import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { OrderDetail } from './order-detail.entity';

export enum PaymentStatusOrder {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CASH_ON_DELIVERY = 'cash_on_delivery',
}

export enum OrderStatus {
  NEW = 'new',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  customerId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @Column({ type: 'numeric', default: 0 })
  totalAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: PaymentStatusOrder,
    default: PaymentStatusOrder.PENDING,
  })
  paymentStatus: PaymentStatusOrder;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.NEW,
  })
  status: OrderStatus;

  @Column({ type: 'text' })
  addressShipping: string;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @Column({ length: 20 })
  phoneNumber: string;

  @Column({ length: 100 })
  recipientName: string;

  @OneToMany(() => OrderDetail, orderDetail => orderDetail.order, {
    cascade: true,
  })
  items: OrderDetail[];
}
