export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum PaymentMethod {
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
  paymentStatus: PaymentStatus;
  createdAt: Date;
}

export interface DetailOrder extends Omit<BaseOrder, "customerId"> {
  addressShipping: string;
  phoneNumber: string;
  note?: string;
  updatedAt: Date;
  items?: OrderItem[];
}

export interface CreateOrder {
  items: {
    variantId: string;
    quantity: number;
  }[];
  paymentMethod: PaymentMethod;
  recipientName: string;
  addressShipping: string;
  phoneNumber: string;
  note?: string;
}
