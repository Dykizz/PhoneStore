import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDetail } from 'src/orders/entities/order-detail.entity';
import { Order, OrderStatus } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderDetail)
    private readonly orderDetailsRepository: Repository<OrderDetail>,
  ) {}
  /**
   * Get time series for sold count and revenue aggregated by granularity.
   * Returns an object with `labels`, `sold` (numbers) and `revenue` (numbers).
   */
  async getTimeSeries(
    from: string,
    to: string,
    granularity: 'day' | 'month' | 'year' = 'day',
  ): Promise<{ labels: string[]; sold: number[]; revenue: number[] }> {
    // choose to_char format based on granularity
    const periodFormat =
      granularity === 'day'
        ? 'YYYY-MM-DD'
        : granularity === 'month'
          ? 'YYYY-MM'
          : 'YYYY';

    const raw = await this.orderDetailsRepository
      .createQueryBuilder('od')
      .leftJoin('od.order', 'o')
      .select(
        `to_char(date_trunc('${granularity}', o."createdAt"), '${periodFormat}')`,
        'period',
      )
      .addSelect('SUM(od.quantity)', 'sold')
      .addSelect('SUM(od."itemTotal")', 'revenue')
      .where('o."createdAt" BETWEEN :from AND :to', { from, to })
      .andWhere('o.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany();

    const labels: string[] = raw.map(r => r.period);
    const sold = raw.map(r => Number(r.sold ?? 0));
    const revenue = raw.map(r => Number(r.revenue ?? 0));
    return { labels, sold, revenue };
  }

  /**
   * Top customers by revenue within date range.
   * Returns up to `limit` customers with fields { customerId, name, revenue, orders }.
   */
  async getTopCustomers(
    from: string,
    to: string,
    limit = 5,
  ): Promise<
    Array<{ customerId: string; name: string; revenue: number; orders: number }>
  > {
    const raw = await this.ordersRepository
      .createQueryBuilder('o')
      .leftJoin('o.customer', 'u')
      .leftJoin('o.items', 'od')
      .select('u.id', 'customerId')
      .addSelect('COALESCE(u.userName, u.email)', 'name')
      .addSelect('SUM(od."itemTotal")', 'revenue')
      .addSelect('COUNT(DISTINCT o.id)', 'orders')
      .where('o."createdAt" BETWEEN :from AND :to', { from, to })
      .andWhere('o.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .groupBy('u.id, u.userName, u.email')
      .orderBy('revenue', 'DESC')
      .limit(limit)
      .getRawMany();

    return raw.map(r => ({
      customerId: r.customerId,
      name: r.name,
      revenue: Number(r.revenue ?? 0),
      orders: Number(r.orders ?? 0),
    }));
  }

  /**
   * Top products by quantity sold within date range.
   * Returns up to `limit` products with fields { productId, name, sold, revenue }.
   */
  async getTopProducts(
    from: string,
    to: string,
    limit = 5,
  ): Promise<
    Array<{ productId: string; name: string; sold: number; revenue: number }>
  > {
    const raw = await this.orderDetailsRepository
      .createQueryBuilder('od')
      .leftJoin('od.order', 'o')
      .leftJoin('od.product', 'p')
      .select('od.productId', 'productId')
      .addSelect(
        'COALESCE(p.name, od."snapshotProdct"->>\'productName\')',
        'name',
      )
      .addSelect('SUM(od.quantity)', 'sold')
      .addSelect('SUM(od."itemTotal")', 'revenue')
      .where('o."createdAt" BETWEEN :from AND :to', { from, to })
      .andWhere('o.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .groupBy('od.productId, p.name, od."snapshotProdct"')
      .orderBy('sold', 'DESC')
      .limit(limit)
      .getRawMany();

    return raw.map(r => ({
      productId: r.productId,
      name: r.name,
      sold: Number(r.sold ?? 0),
      revenue: Number(r.revenue ?? 0),
    }));
  }
}
