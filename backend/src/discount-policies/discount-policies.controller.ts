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
import { DiscountPoliciesService } from './discount-policies.service';
import { CreateDiscountPolicyDto } from './dto/create-discount-policy.dto';
import { UpdateDiscountPolicyDto } from './dto/update-discount-policy.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

@Controller('discount-policies')
export class DiscountPoliciesController {
  constructor(
    private readonly discountPoliciesService: DiscountPoliciesService,
  ) {}

  @Post()
  @ResponseMessage('Chính sách giảm giá đã được tạo thành công')
  async create(@Body() createDiscountPolicyDto: CreateDiscountPolicyDto) {
    return await this.discountPoliciesService.createDiscountPolicy(
      createDiscountPolicyDto,
    );
  }

  @Get()
  @ResponseMessage('Lấy danh sách chính sách giảm giá thành công')
  async findAll(@Query() query: PaginationQueryDto) {
    return await this.discountPoliciesService.findAll(query);
  }

  @Patch(':id')
  @ResponseMessage('Chính sách giảm giá đã được cập nhật thành công')
  async update(
    @Param('id') id: string,
    @Body() updateDiscountPolicyDto: UpdateDiscountPolicyDto,
  ) {
    return await this.discountPoliciesService.updateDiscountPolicy(
      id,
      updateDiscountPolicyDto,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.discountPoliciesService.removeDiscountPolicy(id);
  }
}
