import { Transform } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateDiscountPolicyDto {
  @IsString({ message: 'Tên chính sách giảm giá phải là chuỗi ký tự' })
  name: string;

  @IsString({ message: 'Mô tả chính sách giảm giá phải là chuỗi ký tự' })
  @IsOptional()
  description?: string;

  @IsNumber({}, { message: 'Giá trị giảm giá phải là một số' })
  @Min(0, { message: 'Giá trị giảm giá phải lớn hơn hoặc bằng 0' })
  @Max(100, { message: 'Giá trị giảm giá phải nhỏ hơn hoặc bằng 100' })
  discountPercent: number;

  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'Ngày bắt đầu không hợp lệ' })
  startDate: Date;

  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'Ngày kết thúc không hợp lệ' })
  endDate: Date;
}
