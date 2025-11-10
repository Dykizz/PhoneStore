import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MinLength,
  MaxLength,
  IsPhoneNumber,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(100)
  userName: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsPhoneNumber('VN')
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  defaultAddress?: string;
}
