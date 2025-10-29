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
