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
  ) {}

  async create(createGoodsReceiptDto: CreateGoodsReceiptDto, user: IUser) {
    const { products, supplierId, note } = createGoodsReceiptDto;

    if (!products || products.length === 0) {
      throw new Error('Danh sách sản phẩm không được để trống');
    }

    let totalPrice = 0;
    let totalQuantity = 0;
    const totalUniqueProducts = products.length;

    products.forEach(product => {
      totalPrice += product.price * product.quantity;
      totalQuantity += product.quantity;
    });

    console.log({ totalPrice, totalQuantity, totalUniqueProducts });

    const goodsReceipt = this.goodsReceiptRepository.create({
      supplierId,
      employeeRecordId: user.id,
      note,
      totalPrice,
      totalQuantity,
      totalUniqueProducts,
    });

    // ✅ Lưu phiếu nhập
    const savedReceipt = await this.goodsReceiptRepository.save(goodsReceipt);

    // ✅ Lưu chi tiết phiếu nhập
    const goodsReceiptDetails = products.map(product =>
      this.goodsReceiptDetailRepository.create({
        goodsReceiptId: savedReceipt.id,
        productId: product.productId,
        quantity: product.quantity,
        price: product.price,
      }),
    );

    await this.goodsReceiptDetailRepository.save(goodsReceiptDetails);

    return savedReceipt;
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
      relations: ['product'],
    });

    const detailGoodsReceipt: DetailGoodsReceipt = {
      id: goodsReceipt.id,
      supplierId: goodsReceipt.supplierId,
      supplierName: goodsReceipt.supplier.name,
      note: goodsReceipt.note,
      products: details.map(detail => ({
        productId: detail.productId,
        image: detail.product.variants[0]?.image || '',
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
