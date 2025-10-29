import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as ms from 'ms';
import { ConfigService } from '@nestjs/config';
import { IUser, User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dtos/register-user.dto';
import { BaseUserDto } from 'src/users/dto/response-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  generateAccessToken(payload: IUser): string {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m',
    });
  }

  generateRefreshToken(payload: IUser, remember: boolean = false): string {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: remember
        ? process.env.JWT_REFRESH_TOKEN_EXPIRATION_REMEMBER || '30d'
        : process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d',
    });
  }

  async updateRefreshToken(id: string, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateUser(id, { refreshToken: hashedToken });
  }

  async validateRefreshToken(userId: string, token: string): Promise<boolean> {
    const user: User = await this.usersService.findById(userId);
    return bcrypt.compare(token, user.refreshToken);
  }

  async generateAuthRespone(user: IUser): Promise<{
    accessToken: string;
    refreshToken: string;
    remember: boolean;
    user: BaseUserDto;
  }> {
    const payload: IUser = {
      id: user.id,
      email: user.email,
      userName: user.userName,
      role: user.role,
      remember: user.remember || false,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload, user.remember);

    await this.updateRefreshToken(user.id, refreshToken);
    const profileUser = await this.usersService.getProfile(user.id);
    console.log('Profile user fetched:', profileUser);
    return {
      accessToken,
      refreshToken,
      remember: user.remember || false,
      user: {
        id: profileUser.id,
        email: profileUser.email,
        userName: profileUser.userName,
        avatar: profileUser.avatar,
        role: profileUser.role,
      },
    };
  }

  async logout(user: IUser): Promise<void> {
    await this.usersService.updateUser(user.id, { refreshToken: '' });
  }

  async refreshToken(oldRefreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    let payload: IUser;
    try {
      payload = this.jwtService.verify(oldRefreshToken, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }

    const { id: userId } = payload;

    const isValid = await this.validateRefreshToken(userId, oldRefreshToken);

    if (!isValid) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    const user: IUser = {
      id: userId,
      email: payload.email,
      userName: payload.userName,
      role: payload.role,
      remember: payload.remember || false,
    };

    const accessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user, user.remember);

    await this.updateRefreshToken(userId, newRefreshToken);
    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async registerAccount(registerDto: RegisterUserDto): Promise<void> {
    const existingUser = await this.usersService
      .findByEmail(registerDto.email)
      .catch(() => null);
    if (existingUser) {
      throw new ConflictException('Email này đã được sử dụng.');
    }
    await this.usersService.create(registerDto);
  }
}
