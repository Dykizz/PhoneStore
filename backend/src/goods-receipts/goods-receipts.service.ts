import { ProductsService } from './../products/products.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { UpdateGoodsReceiptDto } from './dto/update-goods-receipt.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GoodsReceipt } from './entities/goods-receipt.entity';
import { In, Repository } from 'typeorm';
import { GoodsReceiptDetail } from './entities/goods-receipt-detail.entity';
import { IUser } from 'src/users/entities/user.entity';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { DetailGoodsReceipt } from './dto/response-goods-receipt.dto';

@Injectable()
export class GoodsReceiptsService {
  constructor(
    @InjectRepository(GoodsReceipt)
    private readonly goodsReceiptRepository: Repository<GoodsReceipt>,
    @InjectRepository(GoodsReceiptDetail)
    private readonly goodsReceiptDetailRepository: Repository<GoodsReceiptDetail>,
    private readonly productsService: ProductsService,
  ) {}

  async create(createGoodsReceiptDto: CreateGoodsReceiptDto, user: IUser) {
    const { products, supplierId, note } = createGoodsReceiptDto;

    if (!products || products.length === 0) {
      throw new Error('Danh sách sản phẩm không được để trống');
    }

    const queryRunner =
      this.goodsReceiptRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalPrice = 0;
      let totalQuantity = 0;
      const totalUniqueProducts = products.length;
      const quantityEachProduct = products.reduce((acc, product) => {
        const totalQuantityForProduct = product.variants.reduce(
          (sum, v) => sum + v.quantity,
          0,
        );
        acc[product.productId] = totalQuantityForProduct;
        return acc;
      }, {});

      products.forEach(product => {
        totalPrice += product.price * quantityEachProduct[product.productId];
        totalQuantity += quantityEachProduct[product.productId];
      });

      for (const product of products) {
        for (const variant of product.variants) {
          await queryRunner.manager.increment(
            'product_variants',
            { id: variant.id },
            'quantity',
            variant.quantity,
          );

          await queryRunner.manager.increment(
            'products',
            { id: product.productId },
            'quantity',
            variant.quantity,
          );
        }
      }

      const goodsReceipt = queryRunner.manager.create(GoodsReceipt, {
        supplierId,
        employeeRecordId: user.id,
        note,
        totalPrice,
        totalQuantity,
        totalUniqueProducts,
      });

      const savedReceipt = await queryRunner.manager.save(goodsReceipt);

      const goodsReceiptDetails = products.map(product => {
        return queryRunner.manager.create(GoodsReceiptDetail, {
          goodsReceiptId: savedReceipt.id,
          productId: product.productId,
          quantity: quantityEachProduct[product.productId],
          variants: product.variants,
          price: product.price,
        });
      });

      await queryRunner.manager.save(goodsReceiptDetails);

      await queryRunner.commitTransaction();
      return savedReceipt;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<GoodsReceipt>> {
    const validSortFields = [
      'totalPrice',
      'totalQuantity',
      'totalUniqueProducts',
      'createdAt',
      'updatedAt',
    ];

    const searchFields = ['supplier.name', 'note'];

    const queryBuilder = this.goodsReceiptRepository
      .createQueryBuilder('goods_receipts')
      .leftJoinAndSelect('goods_receipts.supplier', 'supplier');
    if (query.page < 1) query.page = 1;
    if (query.limit < 1) query.limit = 10;
    const skip = (query.page - 1) * query.limit;

    query.applyToQueryBuilder(
      queryBuilder,
      'goods_receipts',
      searchFields,
      validSortFields,
    );
    const [items, total] = await queryBuilder
      .skip(skip)
      .take(query.limit)
      .getManyAndCount();

    return new PaginatedResponseDto(items, total, query.page, query.limit);
  }

  async findOne(id: string): Promise<DetailGoodsReceipt | null> {
    const goodsReceipt = await this.goodsReceiptRepository.findOne({
      where: { id },
      relations: ['supplier'],
    });

    if (!goodsReceipt) {
      throw new NotFoundException('Phiếu nhập hàng không tồn tại');
    }

    const details = await this.goodsReceiptDetailRepository.find({
      where: { goodsReceiptId: id },
      relations: ['product', 'product.variants'],
    });

    const detailGoodsReceipt: DetailGoodsReceipt = {
      id: goodsReceipt.id,
      supplierId: goodsReceipt.supplierId,
      supplierName: goodsReceipt.supplier.name,
      note: goodsReceipt.note,
      products: details.map(detail => ({
        productId: detail.productId,
        variants: detail.variants,
        name: detail.product.name,
        priceSold: detail.product.price,
        quantity: detail.quantity,
        price: Number(detail.price),
      })),
    };
    return detailGoodsReceipt;
  }

  async update(id: string, updateGoodsReceiptDto: UpdateGoodsReceiptDto) {
    const { products } = updateGoodsReceiptDto;
    if (products && products.length > 0) {
    }
    return `This action updates a #${id} goodsReceipt`;
  }

  async updateOrCreateGoodReceiptDetail(
    goodsReceiptId: string,
    productId: string,
    data: { quantity: number; price: number },
  ) {
    const detail = await this.goodsReceiptDetailRepository.findOne({
      where: { goodsReceiptId, productId },
    });

    if (detail) {
      detail.quantity = data.quantity;
      detail.price = data.price;
      return await this.goodsReceiptDetailRepository.save(detail);
    } else {
      const newDetail = this.goodsReceiptDetailRepository.create({
        goodsReceiptId,
        productId,
        quantity: data.quantity,
        price: data.price,
      });
      return await this.goodsReceiptDetailRepository.save(newDetail);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} goodsReceipt`;
  }
}
