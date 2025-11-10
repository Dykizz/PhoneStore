import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { SetRefreshTokenInterceptor } from 'src/common/interceptors/setRefreshToken.interceptor';
import type { IUser } from 'src/users/entities/user.entity';
import { RegisterUserDto } from './dtos/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(SetRefreshTokenInterceptor)
  @Post('login')
  @ResponseMessage('Đăng nhập thành công')
  async signIn(@User() user: IUser) {
    return await this.authService.generateAuthRespone(user);
  }

  @Post('logout')
  @ResponseMessage('Đăng xuất thành công')
  async signOut(
    @Res({ passthrough: true }) res: Response,
    @User() user: IUser,
  ) {
    await this.authService.logout(user);
    res.clearCookie('refreshToken');
  }

  @Public()
  @Post('refresh-token')
  @UseInterceptors(SetRefreshTokenInterceptor)
  @ResponseMessage('Làm mới token thành công')
  async refreshToken(@Req() req: Request) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new BadRequestException('Không tìm thấy refresh token');
    }
    return await this.authService.refreshToken(refreshToken);
  }

  @Public()
  @Post('register')
  @ResponseMessage('Đăng ký tài khoản thành công')
  async register(@Body() registerDto: RegisterUserDto) {
    await this.authService.registerAccount(registerDto);
  }
}
