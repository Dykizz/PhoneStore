import { Module } from '@nestjs/common';
import { ForgotPasswordController } from './forgot-password.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordResetToken } from './entities/forgot-password.entity';
import { ForgotPasswordService } from './forgot-password.service';
import { User } from 'src/users/entities/user.entity';
import { EmailModule } from 'src/mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, PasswordResetToken]), EmailModule],
  controllers: [ForgotPasswordController],
  providers: [ForgotPasswordService],
})
export class ForgotPasswordModule {}
