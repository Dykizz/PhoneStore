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

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}
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
}
