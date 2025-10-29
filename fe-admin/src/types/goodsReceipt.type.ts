import { DetailGoodsReceipt } from "./../../../backend/src/goods-receipts/dto/response-goods-receipt.dto";
export interface BaseGoodsReceipt {
  id: string;
  supplierId: string;
  totalQuantity: number;
  totalUniqueProducts: number;
  totalPrice: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGoodReceipt {
  supplierId: string;
  products: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  note?: string;
}

export interface DetailGoodsReceipt {
  id: string;
  products: {
    productId: string;
    image: string;
    name: string;
    priceSold: number;
    quantity: number;
    price: number;
  }[];
  note?: string;
  supplierId: string;
  supplierName: string;
}
