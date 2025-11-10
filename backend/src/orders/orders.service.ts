import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import {
  Order,
  OrderStatus,
  PaymentStatusOrder,
} from './entities/order.entity';
import { Repository, DeepPartial, DataSource } from 'typeorm';
import { OrderDetail } from './entities/order-detail.entity';
import { IUser } from 'src/users/entities/user.entity';
import { ProductsService } from 'src/products/products.service';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { BaseOrder, DetailOrder } from './dto/response-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderDetail)
    private readonly orderDetailsRepository: Repository<OrderDetail>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly productService: ProductsService,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    user: IUser,
  ): Promise<BaseOrder> {
    const { items } = createOrderDto;

    // ✅ 1. Validate và load variants
    const variants = await Promise.all(
      items.map(item => this.productService.findVariantById(item.variantId)),
    );

    // ✅ 2. Validate quantity (CHECK NGAY KHI TẠO)
    items.forEach(item => {
      const variant = variants.find(v => v.id === item.variantId);
      if (!variant) {
        throw new BadRequestException('Sản phẩm không tồn tại');
      }
      if (!variant.product.isReleased) {
        throw new BadRequestException(
          `Sản phẩm "${variant.product.name}" chưa được phát hành`,
        );
      }
      // ✅ CHECK QUANTITY
      if (variant.quantity < item.quantity) {
        throw new BadRequestException(
          `Sản phẩm "${variant.product.name} - ${variant.color}" chỉ còn ${variant.quantity} sản phẩm`,
        );
      }
    });

    // ✅ 3. Tính tổng tiền (có discount)
    let totalAmount = 0;
    const orderDetailsData = items.map(item => {
      const variant = variants.find(v => v.id === item.variantId);
      const discountPercent =
        variant.product.discountPolicy?.discountPercent || 0;
      const unitPrice =
        Number(variant.product.price) * (1 - discountPercent / 100);
      const itemTotal = unitPrice * item.quantity;

      totalAmount += itemTotal;
      const price = Number(variant.product.price);

      return {
        variant,
        item,
        price,
        discountPercent,
        itemTotal,
      };
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ✅ 4. Tạo Order
      const order = queryRunner.manager.create(Order, {
        customerId: user.id,
        addressShipping: createOrderDto.addressShipping,
        phoneNumber: createOrderDto.phoneNumber,
        note: createOrderDto.note,
        totalAmount,
        paymentMethod: createOrderDto.paymentMethod,
        paymentStatus: PaymentStatusOrder.PENDING,
        status: OrderStatus.NEW,
        recipientName: createOrderDto.recipientName,
      });
      const savedOrder = await queryRunner.manager.save(order);

      // ✅ 5. Tạo OrderDetails với snapshot
      const orderDetails = orderDetailsData.map(
        ({ variant, item, price, discountPercent, itemTotal }) => {
          return queryRunner.manager.create(OrderDetail, {
            orderId: savedOrder.id,
            productId: variant.product.id,
            variantId: variant.id,
            quantity: item.quantity,
            price,
            itemTotal,
            discountPercent: discountPercent,
            snapshotProdct: {
              productType: variant.product.productType.name,
              brandName: variant.product.brand.name,
              productName: variant.product.name,
              variantColor: variant.color,
              variantImage: variant.image,
            },
          });
        },
      );
      await queryRunner.manager.save(orderDetails);

      // ✅ 6. TRỪ QUANTITY NGAY KHI TẠO ĐơN
      for (const { item, variant } of orderDetailsData) {
        await queryRunner.manager.decrement(
          'product_variants',
          { id: variant.id },
          'quantity',
          item.quantity,
        );

        await queryRunner.manager.decrement(
          'products',
          { id: variant.product.id },
          'quantity',
          item.quantity,
        );
      }

      // ✅ 7. Commit transaction
      await queryRunner.commitTransaction();

      // ✅ 8. Return order với details
      const result = await this.ordersRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['customer'],
      });

      const response: BaseOrder = {
        id: order.id,
        customerId: order.customerId,
        customer: {
          id: user.id,
          userName: user.userName,
          email: user.email,
        },
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        recipientName: order.recipientName,
      };

      return response;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error creating order:', error);
      throw new BadRequestException('Lỗi tạo đơn hàng: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new BadRequestException('Đơn hàng không tồn tại');
    }

    // ✅ Validate business logic
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      new: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      processing: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      shipped: [OrderStatus.DELIVERED],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      throw new BadRequestException(
        `Không thể chuyển từ trạng thái "${order.status}" sang "${status}"`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ✅ CHỈ HỦY ĐƠN MỚI HOẶC ĐANG XỬ LÝ THÌ CỘNG LẠI QUANTITY
      if (status === OrderStatus.CANCELLED) {
        const orderDetails = await queryRunner.manager.find(OrderDetail, {
          where: { orderId: order.id },
        });

        for (const detail of orderDetails) {
          await queryRunner.manager.increment(
            'product_variants',
            { id: detail.variantId },
            'quantity',
            detail.quantity,
          );

          await queryRunner.manager.increment(
            'products',
            { id: detail.productId },
            'quantity',
            detail.quantity,
          );
        }
      }

      order.status = status;
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error updating order status:', error);
      throw new BadRequestException(
        'Lỗi cập nhật trạng thái đơn hàng: ' + error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BaseOrder>> {
    const validSortFields = ['totalAmount', 'createdAt', 'updatedAt'];
    const queryBuilder = this.ordersRepository
      .createQueryBuilder('orders')
      .leftJoinAndSelect('orders.customer', 'customer');
    if (query.page < 1) query.page = 1;
    if (query.limit < 1) query.limit = 10;
    const skip = (query.page - 1) * query.limit;

    query.applyToQueryBuilder(queryBuilder, 'orders', [], validSortFields);

    if (query.search) {
      queryBuilder.andWhere(
        'customer.userName ILIKE :search OR customer.email ILIKE :search',
        { search: `%${query.search}%` },
      );
    }
    const [items, total] = await queryBuilder
      .skip(skip)
      .take(query.limit)
      .getManyAndCount();
    const resultItems: BaseOrder[] = items.map(order => ({
      id: order.id,
      customerId: order.customerId,
      customer: {
        id: order.customer.id,
        userName: order.customer.userName,
        email: order.customer.email,
      },
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      recipientName: order.recipientName,
    }));

    return new PaginatedResponseDto(
      resultItems,
      total,
      query.page,
      query.limit,
    );
  }

  async findOne(id: string): Promise<DetailOrder> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['customer', 'items'],
    });
    if (!order) {
      throw new BadRequestException('Đơn hàng không tồn tại');
    }
    const detailOrder: DetailOrder = {
      id: order.id,
      customer: {
        id: order.customer.id,
        userName: order.customer.userName,
        email: order.customer.email,
      },
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      addressShipping: order.addressShipping,
      phoneNumber: order.phoneNumber,
      recipientName: order.recipientName,
      note: order.note,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.snapshotProdct.productName,
        variantId: item.variantId,
        variantColor: item.snapshotProdct.variantColor,
        productImage: item.snapshotProdct.variantImage,
        quantity: item.quantity,
        price: item.price,
        discountPercent: item.discountPercent,
        totalAmount: item.itemTotal,
      })),
    };
    return detailOrder;
  }

  async updatePaymentSatus(id: string, paymentStatus: PaymentStatusOrder) {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      throw new BadRequestException('Đơn hàng không tồn tại');
    }
    order.paymentStatus = paymentStatus;
    await this.ordersRepository.save(order);
  }

  async findMyOrders(
    query: PaginationQueryDto,
    user: IUser,
  ): Promise<PaginatedResponseDto<BaseOrder>> {
    // ✅ Tạo custom query có filter customerId
    const customQuery = { ...query, customerId: user.id };

    const validSortFields = ['totalAmount', 'createdAt', 'updatedAt'];
    const queryBuilder = this.ordersRepository
      .createQueryBuilder('orders')
      .leftJoinAndSelect('orders.customer', 'customer')
      .where('orders.customerId = :customerId', { customerId: user.id });

    if (query.page < 1) query.page = 1;
    if (query.limit < 1) query.limit = 10;
    const skip = (query.page - 1) * query.limit;

    query.applyToQueryBuilder(queryBuilder, 'orders', [], validSortFields);

    if (query.search) {
      queryBuilder.andWhere(
        'customer.userName ILIKE :search OR customer.email ILIKE :search OR orders.recipientName ILIKE :search OR orders.phoneNumber ILIKE :search',
        { search: `%${query.search}%` },
      );
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(query.limit)
      .getManyAndCount();

    const resultItems: BaseOrder[] = items.map(order => ({
      id: order.id,
      customerId: order.customerId,
      customer: {
        id: order.customer.id,
        userName: order.customer.userName,
        email: order.customer.email,
      },
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      recipientName: order.recipientName,
    }));

    return new PaginatedResponseDto(
      resultItems,
      total,
      query.page,
      query.limit,
    );
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
