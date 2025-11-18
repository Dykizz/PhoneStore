import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Order } from 'src/orders/entities/order.entity';
import { OrderDetail } from 'src/orders/entities/order-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order, OrderDetail])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
