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
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Thương hiệu được tạo thành công')
  async create(@Body() createBrandDto: CreateBrandDto) {
    return await this.brandsService.createBand(createBrandDto);
  }

  @Get()
  @Public()
  @ResponseMessage('Lấy danh sách thương hiệu thành công')
  async findAll(@Query() query: PaginationQueryDto) {
    return this.brandsService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Lấy thông tin thương hiệu thành công')
  async findOne(@Param('id') id: string) {
    return await this.brandsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Cập nhật thương hiệu thành công')
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return await this.brandsService.updateBand(id, updateBrandDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Xóa thương hiệu thành công')
  async remove(@Param('id') id: string) {
    return await this.brandsService.removeBand(id);
  }
}
