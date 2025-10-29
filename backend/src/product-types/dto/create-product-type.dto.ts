import { IsOptional, IsString } from 'class-validator';

export class CreateProductTypeDto {
  @IsString({ message: 'Tên loại sản phẩm phải là chuỗi ký tự' })
  name: string;

  @IsString({ message: 'Mô tả loại sản phẩm phải là chuỗi ký tự' })
  @IsOptional()
  description?: string;
}
