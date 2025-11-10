import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  IsEmail,
  IsUUID,
} from 'class-validator';

class CustomerInfo {
  @IsString({ message: 'Tên người dùng phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên người dùng không được rỗng' })
  userName: string;
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @IsNotEmpty({ message: 'Số điện thoại không được rỗng' })
  phoneNumber: string;
}
export class CreatePaymentVNPayDto {
  @IsNumber({}, { message: 'Số tiền phải là một số' })
  @Min(1000, { message: 'Số tiền tối thiểu là 1.000 VND' })
  amount: number;

  @IsString({ message: 'Thông tin đơn hàng phải là chuỗi' })
  @IsNotEmpty({ message: 'Thông tin đơn hàng không được rỗng' })
  orderInfo: string;

  @IsNotEmpty({ message: 'Thông tin khách hàng không được rỗng' })
  customerInfo: CustomerInfo;

  @IsString({ message: 'URL redirect phải là chuỗi' })
  @IsNotEmpty({ message: 'URL redirect không được rỗng' })
  returnUrl: string;
}
export class VNPayReturnDto {
  @IsString()
  @IsNotEmpty()
  vnp_Amount: string;

  @IsString()
  @IsOptional()
  vnp_BankCode?: string;

  @IsString()
  @IsOptional()
  vnp_BankTranNo?: string;

  @IsString()
  @IsOptional()
  vnp_CardType?: string;

  @IsString()
  @IsNotEmpty()
  vnp_OrderInfo: string;

  @IsString()
  @IsOptional()
  vnp_PayDate?: string;

  @IsString()
  @IsNotEmpty()
  vnp_ResponseCode: string;

  @IsString()
  @IsNotEmpty()
  vnp_TmnCode: string;

  @IsString()
  @IsOptional()
  vnp_TransactionNo?: string;

  @IsString()
  @IsOptional()
  vnp_TransactionStatus?: string;

  @IsString()
  @IsNotEmpty()
  vnp_TxnRef: string;

  @IsString()
  @IsNotEmpty()
  vnp_SecureHash: string;

  @IsString()
  @IsOptional()
  vnp_SecureHashType?: string;
}

export class CreatePaymentDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString({ message: 'Họ và tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Họ và tên không được rỗng' })
  userName: string;

  @IsNumber({}, { message: 'Số tiền phải là một số' })
  @Min(1000, { message: 'Số tiền tối thiểu là 1.000 VND' })
  amount: number;

  @IsString({ message: 'Thông tin đơn hàng phải là chuỗi' })
  @IsNotEmpty({ message: 'Thông tin đơn hàng không được rỗng' })
  orderInfo: string;

  @IsOptional()
  @IsUUID('4', { message: 'OrderId phải là UUID phiên bản 4' })
  orderId?: string;

  @IsOptional()
  @IsString({ message: 'URL redirect phải là chuỗi' })
  returnUrl?: string; // URL để VNPay redirect về sau thanh toán
}
