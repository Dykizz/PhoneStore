import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  IsUUID,
  Min,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class VariantDto {
  @IsString({ message: 'Màu sắc phải là chuỗi ký tự' })
  color: string;

  @IsString({ message: 'Đường dẫn ảnh phải là chuỗi ký tự' })
  image: string;
}

export class CreateProductDto {
  @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự' })
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString({ message: 'Mô tả ngắn phải là chuỗi ký tự' })
  baseDescription?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả chi tiết phải là chuỗi ký tự' })
  detailDescription?: string;

  @IsOptional()
  @IsArray({ message: 'Variants phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants?: VariantDto[];

  @IsNumber({}, { message: 'Giá phải là số' })
  @IsOptional()
  @Min(0, { message: 'Giá phải lớn hơn hoặc bằng 0' })
  price: number;

  @IsOptional()
  @IsBoolean({ message: 'isReleased phải là giá trị boolean' })
  isReleased?: boolean;

  @IsOptional()
  @IsUUID(undefined, { message: 'discountPolicyId phải là UUID hợp lệ' })
  discountPolicyId?: string;

  @IsUUID(undefined, { message: 'productTypeId phải là UUID hợp lệ' })
  productTypeId: string;

  @IsUUID(undefined, { message: 'brandId phải là UUID hợp lệ' })
  brandId: string;
}
