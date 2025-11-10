export enum PaymentMethod {
  BANK_TRANSFER = "bank_transfer",
  CASH_ON_DELIVERY = "cash_on_delivery",
}

export interface CustomerInfo {
  userName: string;
  email: string;
  phoneNumber: string;
}
export interface CreatePaymentVNPay {
  amount: number;
  orderInfo: string;
  customerInfo: CustomerInfo;
  returnUrl: string;
}
export interface VNPayReturn {
  vnp_Amount: string;
  vnp_BankCode?: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_OrderInfo: string;
  vnp_PayDate?: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo?: string;
  vnp_TransactionStatus?: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
  vnp_SecureHashType?: string;
}

export interface CreatePayment {
  email: string;
  userName: string;
  amount: number;
  orderInfo: string;
  orderId: string;
  returnUrl?: string;
}

export interface CreatePaymentVNPayRequest {
  amount: number;
  orderInfo: string;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
  returnUrl: string;
}
