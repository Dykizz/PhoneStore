import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VariantProduct {
  @IsString({ message: 'ID biến thể phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'ID biến thể không được để trống' })
  id: string;

  @IsString({ message: 'Màu sắc phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Màu sắc không được để trống' })
  color: string;

  @IsString({ message: 'Link ảnh phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Link ảnh không được để trống' })
  image: string;

  @IsNumber({}, { message: 'Số lượng phải là số' })
  @IsNotEmpty({ message: 'Số lượng không được để trống' })
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
