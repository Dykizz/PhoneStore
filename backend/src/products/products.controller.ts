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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { IUser, UserRole } from 'src/users/entities/user.entity';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ResponseMessage('Tạo sản phẩm thành công')
  async create(
    @Body() createProductDto: CreateProductDto,
    @User() user: IUser,
  ) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  @Public()
  @ResponseMessage('Lấy danh sách sản phẩm thành công')
  async findAll(@Query() query: PaginationQueryDto, @User() user: IUser) {
    return this.productsService.findAll(query, user);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Lấy thông tin sản phẩm thành công')
  async findOne(@Param('id') id: string, @User() user: IUser) {
    return await this.productsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ResponseMessage('Cập nhật sản phẩm thành công')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ResponseMessage('Xóa sản phẩm thành công')
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(id);
  }
}
