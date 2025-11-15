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
import { GoodsReceiptsService } from './goods-receipts.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { UpdateGoodsReceiptDto } from './dto/update-goods-receipt.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { IUser } from 'src/users/entities/user.entity';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

@Controller('goods-receipts')
export class GoodsReceiptsController {
  constructor(private readonly goodsReceiptsService: GoodsReceiptsService) {}

  @Post()
  @ResponseMessage('Phiếu nhập hàng được tạo thành công')
  async create(
    @Body() createGoodsReceiptDto: CreateGoodsReceiptDto,
    @User() user: IUser,
  ) {
    return await this.goodsReceiptsService.createGoodsReceipt(
      createGoodsReceiptDto,
      user,
    );
  }

  @Get()
  @ResponseMessage('Lấy danh sách phiếu nhập hàng thành công')
  async findAll(@Query() query: PaginationQueryDto) {
    return await this.goodsReceiptsService.findAll(query);
  }

  @Get(':id')
  @ResponseMessage('Lấy phiếu nhập hàng thành công')
  async findOne(@Param('id') id: string) {
    return await this.goodsReceiptsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGoodsReceiptDto: UpdateGoodsReceiptDto,
  ) {
    return this.goodsReceiptsService.updateGoodsReceipt(
      id,
      updateGoodsReceiptDto,
    );
  }
}
