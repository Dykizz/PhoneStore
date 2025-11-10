import { UsersService } from 'src/users/users.service';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      usernameField: 'email',
      passReqToCallback: true, // cho phép nhận req vào validate()
    });
  }

  async validate(req: Request, email: string, password: string): Promise<any> {
    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      throw new BadRequestException('Email hoặc mật khẩu không đúng');
    }
    const remember: boolean = req.body.remember;

    return { ...user, remember };
  }
}
