import { UserRole } from '../entities/user.entity';

export class BaseUserDto {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

export class DetailUserDto extends BaseUserDto {
  createdAt: Date;
  updatedAt: Date;
}
