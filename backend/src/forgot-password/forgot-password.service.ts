import { ConfigService } from '@nestjs/config';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { User } from 'src/users/entities/user.entity';
import { PasswordResetToken } from './entities/forgot-password.entity';
import { EmailService } from 'src/mail/mail.service';

@Injectable()
export class ForgotPasswordService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PasswordResetToken)
    private tokenRepository: Repository<PasswordResetToken>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Email không tồn tại');
    }

    await this.tokenRepository.delete({ email, used: false });

    const token = randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const resetToken = this.tokenRepository.create({
      email,
      token,
      expiresAt,
    });
    await this.tokenRepository.save(resetToken);
    const resetLink = `${this.configService.get<string>('HOST_CLIENT')}/reset-password?emai=${email}&token=${token}`;
    await this.emailService.sendEmail(email, 'Yêu cầu đặt lại mật khẩu', 'forget-password', {
      user: user.userName,
      link : resetLink,
      expiration: '1 giờ',
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await this.tokenRepository.findOne({
      where: { token, used: false },
    });
    if (!resetToken) {
      throw new BadRequestException('Token không hợp lệ hoặc đã được sử dụng');
    }

    if (new Date() > resetToken.expiresAt) {
      throw new BadRequestException('Token đã hết hạn');
    }

    const user = await this.userRepository.findOne({
      where: { email: resetToken.email },
    });
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }
    user.password = newPassword;
    await this.userRepository.save(user);

    resetToken.used = true;
    await this.tokenRepository.save(resetToken);
  }
}
