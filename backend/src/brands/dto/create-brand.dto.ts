import { IsOptional, IsString } from 'class-validator';

export class CreateBrandDto {
  @IsString({ message: 'Tên thương hiệu phải là chuỗi ký tự' })
  name: string;

  @IsString({ message: 'Mô tả thương hiệu phải là chuỗi ký tự' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'URL hình ảnh phải là chuỗi ký tự' })
  @IsOptional()
  image?: string;
}
