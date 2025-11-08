export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  PAYPAL = "paypal",
  BANK_TRANSFER = "bank_transfer",
  CASH_ON_DELIVERY = "cash_on_delivery",
}

export enum OrderStatus {
  NEW = "new",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

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
