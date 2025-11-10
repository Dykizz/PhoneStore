import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import * as ms from 'ms';

@Injectable()
export class SetRefreshTokenInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {} // Inject config

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      tap((data) => {
        const refreshToken = data?.refreshToken;
        const remember = data?.remember || false;
        if (refreshToken) {
          const refreshTokenExpiration = remember
            ? this.configService.get<number>(
                'JWT_REFRESH_TOKEN_EXPIRATION_REMEMBER',
              )
            : this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRATION');
          const expirationTime = ms(refreshTokenExpiration);
          response.cookie('refreshToken', data.refreshToken, {
            httpOnly: true,
            secure: this.configService.get<string>('NODE_ENV') === 'production',
            sameSite: 'strict',
            path: '/auth/refresh-token',
            maxAge: expirationTime,
          });

          if (data.refreshToken) {
            delete data.refreshToken;
          }
        } else {
          response.clearCookie('refreshToken');
          console.log('Không có refreshToken trong dữ liệu trả về');
        }
      }),
    );
  }
}
