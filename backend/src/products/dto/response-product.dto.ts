import { IsNumber, IsString } from 'class-validator';

export class VariantProduct {
  @IsString({ message: 'ID biến thể phải là chuỗi ký tự' })
  id: string;

  @IsString({ message: 'Màu sắc phải là chuỗi ký tự' })
  color: string;

  @IsString({ message: 'Link ảnh phải là chuỗi ký tự' })
  image: string;

  @IsNumber({}, { message: 'Số lượng phải là số' })
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
  createdBy?: {
    id: string;
    userName: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
  productTypeName: string;
}
