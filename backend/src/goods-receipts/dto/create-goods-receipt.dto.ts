import {
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VariantProduct } from 'src/products/dto/response-product.dto';

class ProductDto {
  @IsUUID()
  productId: string;

  @IsArray({ message: 'Danh sách số lượng phải là mảng' })
  variants: VariantProduct[];

  @IsNumber({}, { message: 'Giá phải là số' })
  @Min(0, { message: 'Giá phải lớn hơn hoặc bằng 0' })
  price: number;
}

export class CreateGoodsReceiptDto {
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  note?: string;

  @IsArray({ message: 'Danh sách sản phẩm phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products: ProductDto[];

  @IsUUID()
  supplierId: string;
}
