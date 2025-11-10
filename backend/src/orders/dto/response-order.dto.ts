import {
  OrderStatus,
  PaymentMethod,
  PaymentStatusOrder,
} from '../entities/order.entity';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantColor: string;
  productImage: string;
  quantity: number;
  price: number;
  discountPercent: number;
  totalAmount: number;
}

export interface BaseOrder {
  id: string;
  customerId: string;
  customer: {
    id: string;
    userName: string;
    email: string;
  };
  recipientName: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatusOrder;
  createdAt: Date;
}

export interface DetailOrder extends Omit<BaseOrder, 'customerId'> {
  addressShipping: string;
  phoneNumber: string;
  note?: string;
  updatedAt: Date;
  items?: OrderItem[];
}
