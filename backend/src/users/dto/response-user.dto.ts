import { UserRole } from '../entities/user.entity';

export class BaseUserDto {
  id: string;
  userName: string;
  email: string;
  avatar?: string;
  role: UserRole;
  phoneNumber?: string;
  isBlocked: boolean; 
}

export class DetailUserDto extends BaseUserDto {
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    id: string;
    userName: string;
  };
  defaultAddress?: string;
}

