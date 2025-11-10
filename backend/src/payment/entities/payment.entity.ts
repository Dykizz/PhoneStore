import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  VNPAY = 'VNPAY',
  MOMO = 'MOMO',
  ZALOPAY = 'ZALOPAY',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  transactionId: string;

  @Column('uuid')
  orderId: string;

  @ManyToOne(() => Order, { nullable: false })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  userName: string;

  @Column()
  email: string;

  @Column('numeric')
  amount: number;

  @Column()
  orderInfo: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.VNPAY,
  })
  paymentMethod: PaymentMethod;

  @Column({ nullable: true })
  vnpTransactionNo?: string;

  @Column({ nullable: true })
  vnpResponseCode?: string;

  @Column({ nullable: true })
  vnpBankCode?: string;

  @Column({ nullable: true })
  vnpCardType?: string;

  @Column('timestamptz', { nullable: true })
  vnpPayDate?: Date;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  failureReason?: string;

  @Column('jsonb', { nullable: true })
  vnpRawData?: any;

  @Column('uuid', { nullable: true })
  subscriptionId?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

// Index
@Index(['status'])
@Index(['createdAt'])
@Index(['email', 'status'])
@Index(['orderId'])
export class PaymentWithIndex extends Payment {}
