export interface VariantProduct {
  id?: string;
  color: string;
  image: string;
  quantity: number;
}

export interface BaseProduct {
  id: string;
  name: string;
  price: number;
  isReleased: boolean;
  variants: VariantProduct[];
  discount?: {
    discountPercent: number;
    startDate: Date;
    endDate: Date;
  };
  baseDescription?: string;
  quantitySold: number;
  quantity: number;
  productTypeId: string;
  brandId: string;
}

export interface DetailProduct extends BaseProduct {
  detailDescription?: string;
  brandName: string;
  productTypeName: string;
}

export interface CreateProduct {
  name: string;
  baseDescription: string;
  detailDescription: string;
  price: number;
  isReleased: true;
  productTypeId: string;
  brandId: string;
  variants: { color: string; image: File | string }[];
  discountPolicyId?: string;
}

export type UpdateProduct = Partial<CreateProduct>;
