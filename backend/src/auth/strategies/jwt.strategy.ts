import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UsersService } from 'src/users/users.service';
import { IUser } from 'src/users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: IUser) {
    const isBlocked = await this.usersService.checkIsBlocked(payload.email);
    if (isBlocked) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa.');
    }
    return {
      id: payload.id,
      email: payload.email,
      userName: payload.userName,
      role: payload.role,
      rememberMe: payload.remember || false,
    };
  }
}
