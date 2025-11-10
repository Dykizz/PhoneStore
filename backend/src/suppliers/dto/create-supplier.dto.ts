import { IsOptional, IsString } from 'class-validator';

export class CreateSupplierDto {
  @IsString({ message: 'Tên nhà cung cấp phải là chuỗi ký tự' })
  name: string;

  @IsString({ message: 'Mô tả nhà cung cấp phải là chuỗi ký tự' })
  @IsOptional()
  description?: string;
}
