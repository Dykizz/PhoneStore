import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { IUser } from 'src/users/entities/user.entity';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { BaseProduct, DetailProduct } from './dto/response-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  private mapEntityToBaseicInfo(product: Product) {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      isReleased: product.isReleased,
      variant: product.variants?.[0],
    };
  }

  async create(createProductDto: CreateProductDto, user: IUser) {
    const existingProduct = await this.productsRepository.findOne({
      where: { name: createProductDto.name },
    });

    if (existingProduct) {
      throw new BadRequestException('Tên sản phẩm đã tồn tại');
    }

    createProductDto.variants = createProductDto.variants?.map(v => ({
      ...v,
      quantity: 0,
    }));

    const newProduct = this.productsRepository.create({
      ...createProductDto,
      createdById: user.id,
      quantity: 0,
    });
    const savedProduct = await this.productsRepository.save(newProduct);
    return this.mapEntityToBaseicInfo(savedProduct);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BaseProduct>> {
    const searchFields = ['name'];
    const validSortFields = [
      'name',
      'createdAt',
      'updatedAt',
      'price',
      'quantity',
      'quantitySold',
      'isReleased',
    ];

    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.discountPolicy', 'discountPolicy');

    if (query.page < 1) query.page = 1;
    if (query.limit < 1) query.limit = 10;

    query.applyToQueryBuilder(
      queryBuilder,
      'product',
      searchFields,
      validSortFields,
    );

    const [items, total] = await queryBuilder.getManyAndCount();

    const mappedItems: BaseProduct[] = items.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      isReleased: product.isReleased,
      image: product.variants?.[0].image,
      discount: product.discountPolicy
        ? {
            discountPercent: product.discountPolicy.discountPercent,
            startDate: product.discountPolicy.startDate,
            endDate: product.discountPolicy.endDate,
          }
        : null,
      quantitySold: product.quantitySold,
      quantity: product.quantity,
      productTypeId: product.productTypeId,
      brandId: product.brandId,
    }));

    return new PaginatedResponseDto(
      mappedItems,
      total,
      query.page,
      query.limit,
    );
  }

  async findOne(id: string): Promise<DetailProduct> {
    const product = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.discountPolicy', 'discountPolicy')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.productType', 'productType')
      .where('product.id = :id', { id })
      .getOne();

    if (!product) {
      throw new BadRequestException('Sản phẩm không tồn tại');
    }

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      isReleased: product.isReleased,
      variants: product.variants || [],
      discount: product.discountPolicy
        ? {
            discountPercent: product.discountPolicy.discountPercent,
            startDate: product.discountPolicy.startDate,
            endDate: product.discountPolicy.endDate,
          }
        : null,
      quantitySold: product.quantitySold,
      quantity: product.quantity,
      productTypeName: product.productType?.name || '',
      brandName: product.brand?.name || '',
      baseDescription: product.baseDescription,
      detailDescription: product.detailDescription,
      productTypeId: product.productTypeId,
      brandId: product.brandId,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<void> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new BadRequestException('Sản phẩm không tồn tại');
    }

    Object.assign(product, updateProductDto);
    await this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new BadRequestException('Sản phẩm không tồn tại');
    }

    await this.productsRepository.remove(product);
  }
}
