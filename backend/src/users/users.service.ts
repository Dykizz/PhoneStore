import { UploadService } from './../upload/upload.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { IUser, User } from './entities/user.entity';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { BaseUserDto, DetailUserDto } from './dto/response-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private uploadService: UploadService,
  ) {}
  async validateUser(email: string, password: string): Promise<IUser | null> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      return null;
    }
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      userName: user.userName,
      role: user.role,
    };
  }

  async getProfile(id: string): Promise<DetailUserDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      userName: user.userName,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      createdBy: user.createdBy && {
        id: user.createdBy.id,
        userName: user.createdBy.userName,
      },
      isBlocked: user.isBlocked,
      defaultAddress: user.defaultAddress,
    };
  }

  //Chỉ dùng trong hệ thống
  async updateUser(id: string, updateData: Partial<User>) {
    await this.usersRepository.update(id, updateData);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async create(createUserDto: CreateUserDto, user?: IUser) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email này đã được sử dụng.');
    }
    const newUser = this.usersRepository.create({
      ...createUserDto,
      createdById: user?.id || null,
    });
    return await this.usersRepository.save(newUser);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BaseUserDto>> {
    const searchFields = ['email', 'userName', 'phoneNumber'];
    const validSortFields = ['email', 'userName', 'createdAt', 'updatedAt'];

    const queryBuilder = this.usersRepository.createQueryBuilder('user');
    if (query.page < 1) query.page = 1;
    if (query.limit > 100) query.limit = 100;
    query.applyToQueryBuilder(
      queryBuilder,
      'user',
      searchFields,
      validSortFields,
    );

    const [users, total] = await queryBuilder.getManyAndCount();

    const userDtos = users.map(user => this.transformToUserBaseDto(user));

    return new PaginatedResponseDto(userDtos, total, query.page, query.limit);
  }

  private transformToUserBaseDto(user: User): BaseUserDto {
    return {
      id: user.id,
      email: user.email,
      userName: user.userName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      avatar: user.avatar,
      isBlocked: user.isBlocked,
    };
  }

  async findOne(id: string): Promise<DetailUserDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!user) {
      throw new BadRequestException('Không tìm thấy người dùng');
    }
    return {
      id: user.id,
      email: user.email,
      userName: user.userName,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isBlocked: user.isBlocked,
      createdBy: user.createdBy && {
        id: user.createdBy.id,
        userName: user.createdBy.userName,
      },
      defaultAddress: user.defaultAddress,
      phoneNumber: user.phoneNumber,
    };
  }
  async update(id: string, updateUserDto: UpdateUserDto) {
    console.log('UpdateUserDto:', updateUserDto);
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('Không tìm thấy người dùng');
    }

    const oldAvatar = user.avatar;
    const newAvatar = updateUserDto.avatar;

    if (newAvatar && oldAvatar && newAvatar !== oldAvatar) {
      try {
        await this.uploadService.deleteMultipleImagesByUrls([oldAvatar]);
      } catch (error) {
        console.error('Error deleting old avatar:', error);
      }
    }

    if (!newAvatar) {
      delete updateUserDto.avatar;
    }

    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }
}
