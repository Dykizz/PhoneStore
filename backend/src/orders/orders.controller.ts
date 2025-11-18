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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { IUser } from 'src/users/entities/user.entity';
import { User } from 'src/common/decorators/user.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { OrderStatus } from './entities/order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ResponseMessage('Đặt hàng thành công')
  async create(@Body() createOrderDto: CreateOrderDto, @User() user: IUser) {
    return await this.ordersService.create(createOrderDto, user);
  }

  @Get()
  @ResponseMessage('Lấy danh sách đơn hàng thành công')
  async findAll(@Query() query: PaginationQueryDto) {
    return await this.ordersService.findAll(query);
  }

  @Get('my-orders')
  @ResponseMessage('Lấy danh sách đơn hàng của bạn thành công')
  async findMyOrders(@User() user: IUser, @Query() query: PaginationQueryDto) {
    return await this.ordersService.findMyOrders(query, user);
  }

  @Get(':id')
  @ResponseMessage('Lấy chi tiết đơn hàng thành công')
  async findOne(@Param('id') id: string) {
    return await this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @ResponseMessage('Cập nhật trạng thái đơn hàng thành công')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    console.log('Updating status to:', status);
    return await this.ordersService.updateStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
