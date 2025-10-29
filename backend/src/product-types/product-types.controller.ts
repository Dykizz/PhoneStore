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
import { ProductTypesService } from './product-types.service';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

@Controller('product-types')
export class ProductTypesController {
  constructor(private readonly productTypesService: ProductTypesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Tạo loại sản phẩm thành công')
  async create(@Body() createProductTypeDto: CreateProductTypeDto) {
    return await this.productTypesService.create(createProductTypeDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Lấy danh sách loại sản phẩm thành công')
  async findAll(@Query() query: PaginationQueryDto) {
    return await this.productTypesService.findAll(query);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateProductTypeDto: UpdateProductTypeDto,
  ) {
    return this.productTypesService.update(id, updateProductTypeDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.productTypesService.remove(id);
  }
}
