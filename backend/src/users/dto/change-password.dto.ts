import { IsString, MinLength, MaxLength } from 'class-validator';
export class ChangePasswordDto {
  @IsString({ message: 'Mật khẩu hiện tại là bắt buộc' })
  currentPassword: string;

  @IsString({ message: 'Mật khẩu mới là bắt buộc' })
  @MinLength(5, { message: 'Mật khẩu mới phải có ít nhất 5 ký tự' })
  @MaxLength(20, { message: 'Mật khẩu mới không được vượt quá 20 ký tự' })
  newPassword: string;
}
