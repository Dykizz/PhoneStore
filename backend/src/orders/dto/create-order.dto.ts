import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod, PaymentStatusOrder } from '../entities/order.entity';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsUUID('4', { message: 'Variant ID không hợp lệ' })
  @IsNotEmpty({ message: 'Variant ID không được để trống' })
  variantId: string;

  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  quantity: number;
}

export class CreateOrderDto {
  @IsArray({ message: 'Danh sách sản phẩm phải là mảng' })
  @ArrayMinSize(1, { message: 'Đơn hàng phải có ít nhất 1 sản phẩm' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNotEmpty({ message: 'Phương thức thanh toán không được để trống' })
  @IsEnum(PaymentMethod, { message: 'Phương thức thanh toán không hợp lệ' })
  paymentMethod: PaymentMethod;

  @IsString({ message: 'Tên người nhận phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên người nhận không được để trống' })
  recipientName: string;

  @IsString({ message: 'Địa chỉ giao hàng phải là chuỗi' })
  @IsNotEmpty({ message: 'Địa chỉ giao hàng không được để trống' })
  addressShipping: string;

  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^[0-9]{10,11}$/, {
    message: 'Số điện thoại phải có 10-11 chữ số',
  })
  phoneNumber: string;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  note?: string;
}
