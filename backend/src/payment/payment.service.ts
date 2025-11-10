import { OrdersService } from './../orders/orders.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ConfigService } from '@nestjs/config';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from './entities/payment.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePaymentDto, VNPayReturnDto } from './dto/create-payment.dto';
import * as crypto from 'crypto';
import { Order, PaymentStatusOrder } from 'src/orders/entities/order.entity';
@Injectable()
export class PaymentService {
  constructor(
    private configService: ConfigService,
    // private readonly mailerService: MailerService,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    private readonly ordersService: OrdersService,
  ) {}

  private get config() {
    return {
      vnp_TmnCode: this.configService.get<string>('VNP_TMNCODE'),
      vnp_HashSecret: this.configService.get<string>('VNP_HASHSECRET'),
      vnp_Url: this.configService.get<string>('VNP_URL'),
      vnp_ReturnUrl: this.configService.get<string>('VNP_RETURNURL'),
    };
  }

  private sortObject(obj: Record<string, any>): Record<string, string> {
    const sorted = {};
    const encodedKeys = [];

    // Encode tất cả keys
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        encodedKeys.push(encodeURIComponent(key));
      }
    }

    // Sort encoded keys
    encodedKeys.sort();

    // Tạo sorted object với encoded keys
    for (let i = 0; i < encodedKeys.length; i++) {
      const originalKey = decodeURIComponent(encodedKeys[i]);
      sorted[encodedKeys[i]] = encodeURIComponent(obj[originalKey]).replace(
        /%20/g,
        '+',
      );
    }

    return sorted;
  }
  private createPaymentUrl(
    amount: number,
    orderInfo: string,
    ipAddr: string,
    transactionId: string,
  ): string {
    if (!amount || amount < 1000) {
      throw new BadRequestException('Số tiền tối thiểu là 1.000 VND');
    }
    if (!orderInfo?.trim()) {
      throw new BadRequestException('Thông tin đơn hàng không được rỗng');
    }

    const config = this.config;
    if (
      !config.vnp_TmnCode ||
      !config.vnp_HashSecret ||
      !config.vnp_Url ||
      !config.vnp_ReturnUrl
    ) {
      throw new BadRequestException('Cấu hình VNPay không đầy đủ');
    }

    // Tạo createDate
    const now = new Date();
    const createDate = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0'),
    ].join('');

    // Format IP
    const formatIp = (ip: string) => {
      if (!ip || ip === '::1') return '127.0.0.1';
      if (ip.includes('::ffff:')) return ip.replace('::ffff:', '');
      return ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
        ? ip
        : '127.0.0.1';
    };

    // Tạo params
    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: config.vnp_TmnCode,
      vnp_Amount: (amount * 100).toString(),
      vnp_CurrCode: 'VND',
      vnp_TxnRef: transactionId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: config.vnp_ReturnUrl,
      vnp_IpAddr: formatIp(ipAddr),
      vnp_CreateDate: createDate,
    };

    // Sort và tạo signature
    const sortedParams = this.sortObject(vnp_Params);
    const signData = Object.keys(sortedParams)
      .map(key => `${key}=${sortedParams[key]}`)
      .join('&');

    const vnp_SecureHash = crypto
      .createHmac('sha512', config.vnp_HashSecret)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    return `${config.vnp_Url}?${signData}&vnp_SecureHash=${vnp_SecureHash}`;
  }

  private getFailureReason(code: string): string {
    const errorMessages = {
      '01': 'Giao dịch không thành công do: Ngân hàng từ chối giao dịch',
      '02': 'Giao dịch không thành công do: Ngân hàng từ chối giao dịch',
      '04': 'Giao dịch không thành công do: Số dư tài khoản không đủ để thực hiện giao dịch',
      '05': 'Giao dịch không thành công do: Url trả lại không hợp lệ',
      '06': 'Giao dịch không thành công do: Lỗi không xác định',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định',
      '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
    };

    return errorMessages[code] || `Giao dịch không thành công. Mã lỗi: ${code}`;
  }

  verifyReturnSignature(params: VNPayReturnDto): boolean {
    const { vnp_SecureHash, ...verifyParams } = params;

    const sortedParams = this.sortObject(verifyParams);
    const signData = Object.keys(sortedParams)
      .map(key => `${key}=${sortedParams[key]}`)
      .join('&');

    const computedHash = crypto
      .createHmac('sha512', this.config.vnp_HashSecret)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    return computedHash === vnp_SecureHash;
  }

  async createPayment(
    createPaymentDto: CreatePaymentDto,
    ipAddr: string,
    userAgent: string,
  ) {
    const transactionId = uuidv4();
    const payment = await this.paymentsRepository.create({
      orderId: createPaymentDto.orderId,
      email: createPaymentDto.email,
      transactionId,
      userName: createPaymentDto.userName,
      amount: createPaymentDto.amount,
      orderInfo: createPaymentDto.orderInfo,
      status: PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.VNPAY,
      ipAddress: ipAddr,
      userAgent,
    });

    await this.paymentsRepository.save(payment);

    return this.createPaymentUrl(
      createPaymentDto.amount,
      createPaymentDto.orderInfo,
      ipAddr,
      transactionId,
    );
  }
  async updatePaymentStatus(query: VNPayReturnDto): Promise<Payment> {
    const {
      vnp_TxnRef,
      vnp_ResponseCode,
      vnp_TransactionNo,
      vnp_BankCode,
      vnp_CardType,
      vnp_PayDate,
      vnp_Amount,
      vnp_TransactionStatus,
    } = query;

    const payment = await this.paymentsRepository.findOne({
      where: { transactionId: vnp_TxnRef },
    });

    if (!payment) {
      throw new BadRequestException(
        'TransactionId không tồn tại: ' + vnp_TxnRef,
      );
    }

    if (payment.status !== PaymentStatus.PENDING) {
      return payment;
    }

    const isValidSignature = this.verifyReturnSignature(query);
    if (!isValidSignature) {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = 'Chữ ký không hợp lệ';
      payment.vnpRawData = query;

      await this.paymentsRepository.save(payment);
      throw new BadRequestException('Chữ ký không hợp lệ');
    }
    const expectedAmount = (payment.amount * 100).toString();
    if (vnp_Amount !== expectedAmount) {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = `Amount mismatch. Expected: ${expectedAmount}, Received: ${vnp_Amount}`;
      payment.vnpRawData = query;
      await this.paymentsRepository.save(payment);
      throw new BadRequestException('Amount mismatch');
    }

    payment.vnpTransactionNo = vnp_TransactionNo;
    payment.vnpResponseCode = vnp_ResponseCode;
    payment.vnpBankCode = vnp_BankCode;
    payment.vnpCardType = vnp_CardType;
    payment.vnpRawData = query;

    if (vnp_PayDate) {
      try {
        const year = parseInt(vnp_PayDate.substring(0, 4));
        const month = parseInt(vnp_PayDate.substring(4, 6)) - 1; // Month 0-indexed
        const day = parseInt(vnp_PayDate.substring(6, 8));
        const hour = parseInt(vnp_PayDate.substring(8, 10));
        const minute = parseInt(vnp_PayDate.substring(10, 12));
        const second = parseInt(vnp_PayDate.substring(12, 14));

        payment.vnpPayDate = new Date(year, month, day, hour, minute, second);
      } catch (error) {
        console.error('Error parsing vnp_PayDate:', vnp_PayDate, error);
        payment.vnpPayDate = new Date();
      }
    }

    // const hostClient = this.configService.get<string>('HOST_CLIENT');
    if (vnp_ResponseCode === '00' && vnp_TransactionStatus === '00') {
      payment.status = PaymentStatus.SUCCESS;
      await this.ordersService.updatePaymentSatus(
        payment.orderId,
        PaymentStatusOrder.COMPLETED,
      );
    } else {
      // Thanh toán thất bại
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = this.getFailureReason(vnp_ResponseCode);
      console.log(
        `Payment ${vnp_TxnRef} failed with code: ${vnp_ResponseCode}`,
      );
    }
    await this.paymentsRepository.save(payment);
    return payment;
  }
}
