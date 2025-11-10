import { VariantDto } from './../../products/dto/create-product.dto';

export interface DetailGoodsReceipt {
  id: string;
  products: {
    productId: string;
    variants: VariantDto[];
    priceSold: number;
    quantity: number;
    price: number;
  }[];
  note?: string;
  supplierId: string;
  supplierName: string;
}
