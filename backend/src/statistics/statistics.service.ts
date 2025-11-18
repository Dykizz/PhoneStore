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
    // validate simple
    const fromTs = new Date(from);
    const toTs = new Date(to);
    if (isNaN(fromTs.getTime()) || isNaN(toTs.getTime())) {
      throw new Error('Invalid from/to datetime');
    }
    if (fromTs > toTs) {
      throw new Error('`from` must be before or equal to `to`');
    }

    const granMap = {
      day: {
        dateTrunc: 'day',
        interval: '1 day',
        labelFormat: 'YYYY-MM-DD',
      },
      month: {
        dateTrunc: 'month',
        interval: '1 month',
        labelFormat: 'YYYY-MM',
      },
      year: {
        dateTrunc: 'year',
        interval: '1 year',
        labelFormat: 'YYYY',
      },
    } as const;

    const g = granMap[granularity];

    const sql = `
    WITH buckets AS (
      SELECT generate_series(
        date_trunc($1, $2::timestamp),
        date_trunc($1, $3::timestamp),
        $4::interval
      ) AS bucket
    ),
    agg AS (
      SELECT
        date_trunc($1, o."createdAt") AS bucket,
        SUM(od.quantity) AS sold,
        SUM(od."itemTotal") AS revenue
      FROM order_details od
      JOIN orders o ON od."orderId" = o.id
      WHERE o."createdAt" BETWEEN $2::timestamp AND $3::timestamp
        AND o."paymentStatus" = 'completed' 
      GROUP BY date_trunc($1, o."createdAt")
    )
    SELECT
      to_char(b.bucket, $5) AS label,
      COALESCE(a.sold, 0)::bigint AS sold,
      COALESCE(a.revenue, 0)::numeric AS revenue
    FROM buckets b
    LEFT JOIN agg a ON a.bucket = b.bucket
    ORDER BY b.bucket ASC;
  `;

    // params: $1 = date_trunc unit, $2 = from, $3 = to, $4 = interval, $5 = to_char format
    const params = [g.dateTrunc, from, to, g.interval, g.labelFormat];

    const raw: Array<{ label: string; sold: string; revenue: string }> =
      await this.orderDetailsRepository.query(sql, params);

    const labels: string[] = [];
    const soldArr: number[] = [];
    const revenueArr: number[] = [];

    raw.shift(); // remove first row which is always zeroes

    for (const row of raw) {
      labels.push(row.label);
      soldArr.push(Number(row.sold ?? 0));
      revenueArr.push(Number(row.revenue ?? 0));
    }

    return { labels, sold: soldArr, revenue: revenueArr };
  }

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
