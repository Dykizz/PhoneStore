import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { User } from 'src/common/decorators/user.decorator';
import { IUser, UserRole } from './entities/user.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('my-profile')
  async getProfile(@User() user: IUser) {
    return await this.usersService.getProfile(user.id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Tạo người dùng thành công')
  create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    return this.usersService.create(createUserDto, user);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Lấy danh sách người dùng thành công')
  async findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Lấy thông tin người dùng thành công')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Cập nhật người dùng thành công')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
