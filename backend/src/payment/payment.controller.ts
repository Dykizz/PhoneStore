import { Controller, Get, Post, Body, Req, Res, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ConfigService } from '@nestjs/config';
import { Public } from 'src/common/decorators/public.decorator';
import { Request, Response } from 'express';
import { CreatePaymentDto, VNPayReturnDto } from './dto/create-payment.dto';
import { PaymentStatus } from './entities/payment.entity';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    // private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  @Post('create-vnpay')
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Req() req: Request,
  ) {
    const vnpUrl = await this.paymentService.createPayment(
      createPaymentDto,
      req.ip,
      req.headers['user-agent'] || '',
    );
    console.log('Redirecting user to VNPay URL:', vnpUrl);
    return { vnpUrl };
  }

  @Get('vnpay-return')
  @Public()
  async vnpayReturn(@Query() query: VNPayReturnDto, @Res() res: Response) {
    const frontendUrl = this.configService.get<string>('HOST_CLIENT');
    try {
      const payment = await this.paymentService.updatePaymentStatus(query);

      if (payment.status === PaymentStatus.SUCCESS) {
        return res.redirect(
          `${frontendUrl}/payment/result?status=success&orderId=${payment.orderId}&amount=${payment.amount}&transactionNo=${payment.vnpTransactionNo}`,
        );
      } else {
        return res.redirect(
          `${frontendUrl}/payment/result?status=failed&orderId=${payment.orderId}&code=${payment.vnpResponseCode}&message=${encodeURIComponent(payment.failureReason || 'Thanh toán thất bại')}`,
        );
      }
    } catch (error) {
      console.error('VNPay return processing error:', error);
      return res.redirect(
        `${frontendUrl}/payment/result?status=error&message=${encodeURIComponent('Có lỗi xảy ra trong quá trình xử lý')}`,
      );
    }
  }
}
