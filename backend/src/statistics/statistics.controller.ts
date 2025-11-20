import { UsersService } from 'src/users/users.service';
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
import { StatisticsService } from './statistics.service';
import { ProductsService } from 'src/products/products.service';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@Controller('statistics')
export class StatisticsController {
  constructor(
    private readonly statisticsService: StatisticsService,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}
  @Get()
  async getSatistics(@Query() query: any) {
    const [soldAndRevenue, top5User, top5Product] = await Promise.all([
      this.statisticsService.getTimeSeries(
        query.from,
        query.to,
        query.granularity,
      ),
      this.statisticsService.getTopCustomers(query.from, query.to, 5),
      this.statisticsService.getTopProducts(query.from, query.to, 5),
    ]);
    return {
      soldAndRevenue,
      top5User,
      top5Product,
    };
  }

  @Get('dashboard-summary')
  @ResponseMessage('Lấy thông tin tổng quan dashboard thành công')
  async getDashboardSummary() {
    const [userSummary, productSummary] = await Promise.all([
      this.usersService.countUsers(),
      this.productsService.countProducts(),
    ]);
    return {
      userSummary,
      productSummary,
    };
  }

  @Get('today-revenue')
  @ResponseMessage(
    'Lấy tổng doanh thu hôm nay và so sánh với hôm qua thành công',
  )
  async getTodayRevenue() {
    return await this.statisticsService.getTodayRevenueComparison();
  }
}
