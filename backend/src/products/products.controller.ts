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
import { IUser } from 'src/users/entities/user.entity';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ResponseMessage('Tạo sản phẩm thành công')
  async create(
    @Body() createProductDto: CreateProductDto,
    @User() user: IUser,
  ) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  @ResponseMessage('Lấy danh sách sản phẩm thành công')
  async findAll(@Query() query: PaginationQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ResponseMessage('Lấy thông tin sản phẩm thành công')
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật sản phẩm thành công')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ResponseMessage('Xóa sản phẩm thành công')
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(id);
  }
}
