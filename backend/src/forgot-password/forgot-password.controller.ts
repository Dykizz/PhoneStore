import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';

import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { ForgotPasswordService } from './forgot-password.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('forgot-password')
export class ForgotPasswordController {
  constructor(private readonly forgotPasswordService: ForgotPasswordService) {}
  @Post()
  @Public()
  @ResponseMessage('Email reset đã được gửi')
  async forgotPassword(@Body('email') email: string) {
    await this.forgotPasswordService.forgotPassword(email);
  }

  @Post('reset-password')
  @Public()
  @ResponseMessage('Mật khẩu đã được reset')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.forgotPasswordService.resetPassword(token, newPassword);
  }
}
