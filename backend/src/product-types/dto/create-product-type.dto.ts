import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateProductTypeDto {
  @IsString({ message: 'Tên loại sản phẩm phải là chuỗi ký tự' })
  name: string;

  @IsString({ message: 'Mô tả loại sản phẩm phải là chuỗi ký tự' })
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsArray({ message: 'Thông số kỹ thuật mặc định phải là một mảng' })
  @IsString({
    each: true,
    message: 'Mỗi thông số kỹ thuật phải là chuỗi ký tự',
  })
  defaultSpecifications?: string[];
}
