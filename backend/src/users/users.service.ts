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
      username: user.username,
      role: user.role,
    };
  }

  async getProfile(id: string): Promise<DetailUserDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email này đã được sử dụng.');
    }
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
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
  // Helper method để transform User entity thành UserBaseDto
  private transformToUserBaseDto(user: User): BaseUserDto {
    return {
      id: user.id,
      email: user.email,
      userName: user.userName,
      role: user.role,
      avatar: user.avatar,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
