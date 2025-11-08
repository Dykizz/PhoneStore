import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
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

export interface DetailOrder {
  id: string;
  customer: {
    id: string;
    userName: string;
    email: string;
  };
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  addressShipping: string;
  phoneNumber: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}

export interface BaseOrder {
  id: string;
  customerId: string;
  customer: {
    id: string;
    userName: string;
    email: string;
  };
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: Date;
}
