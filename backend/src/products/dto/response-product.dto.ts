export interface BaseProduct {
  id: string;
  name: string;
  price: number;
  isReleased: boolean;
  image: string;
  discount?: {
    discountPercent: number;
    startDate: Date;
    endDate: Date;
  };
  quantitySold: number;
  quantity: number;
  productTypeId: string;
  brandId: string;
}

export interface DetailProduct extends Omit<BaseProduct, 'image'> {
  baseDescription?: string;
  detailDescription?: string;
  variants: {
    color: string;
    image: string;
    quantity: number;
  }[];
  brandName: string;
  productTypeName: string;
}
