import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto, VariantDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { In, Repository } from 'typeorm';
import { IUser, UserRole } from 'src/users/entities/user.entity';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { BaseProduct, DetailProduct } from './dto/response-product.dto';
import { ProductVariant } from './entities/product-variant.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly productVariantsRepository: Repository<ProductVariant>,
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

  private async deleteProductVariants(ids: string[]) {
    return await this.productVariantsRepository.delete({ productId: In(ids) });
  }

  private async createProductVariants(
    variantDto: VariantDto[],
    productId: string,
  ) {
    const variants = variantDto.map(v => ({
      color: v.color,
      image: v.image,
      quantity: 0,
      productId: productId,
    }));
    return await this.productVariantsRepository.save(variants);
  }

  async addQuantityToVariant(
    variantId: string,
    quantityToAdd: number,
  ): Promise<void> {
    const variant = await this.productVariantsRepository.findOne({
      where: { id: variantId },
    });
    if (!variant) {
      throw new BadRequestException('Biến thể sản phẩm không tồn tại');
    }
    variant.quantity += quantityToAdd;
    await this.productVariantsRepository.save(variant);

    const product = await this.productsRepository.findOne({
      where: { id: variant.productId },
    });
    if (product) {
      product.quantity += quantityToAdd;
      await this.productsRepository.save(product);
    }
  }

  async create(createProductDto: CreateProductDto, user: IUser) {
    const existingProduct = await this.productsRepository.findOne({
      where: { name: createProductDto.name },
    });

    if (existingProduct) {
      throw new BadRequestException('Tên sản phẩm đã tồn tại');
    }
    const variants =
      createProductDto.variants?.map(v => ({
        id: v.id,
        color: v.color,
        image: v.image,
        quantity: 0,
      })) || [];

    const newProduct = this.productsRepository.create({
      ...createProductDto,
      createdById: user.id,
      quantity: 0,
    });
    const savedProduct = await this.productsRepository.save(newProduct);
    const createdVariants = await this.createProductVariants(
      variants,
      savedProduct.id,
    );

    variants.forEach((v, index) => {
      v.id = createdVariants[index].id;
    });

    this.productsRepository.update(savedProduct.id, { variants: variants });

    return this.mapEntityToBaseicInfo(savedProduct);
  }

  async findAll(
    query: PaginationQueryDto,
    user: IUser,
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
      .leftJoinAndSelect('product.discountPolicy', 'discountPolicy')
      .leftJoinAndSelect('product.variants', 'variants')
      .where('product.isReleased = :isReleased', {
        isReleased: !user || user.role === UserRole.USER,
      });

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
      productTypeId: product.productTypeId,
      brandId: product.brandId,
      baseDescription: product.baseDescription,
    }));

    return new PaginatedResponseDto(
      mappedItems,
      total,
      query.page,
      query.limit,
    );
  }

  async findOne(id: string, user: IUser): Promise<DetailProduct> {
    const product = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.discountPolicy', 'discountPolicy')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.productType', 'productType')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.createdBy', 'createdBy')
      .where('product.id = :id', { id })
      .getOne();

    if (!product) {
      throw new BadRequestException('Sản phẩm không tồn tại');
    }

    const response = {
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
    console.log('user in findOne product service', user?.role);

    if (!user || user.role === UserRole.USER) return response;
    return {
      ...response,
      createdBy: {
        id: product.createdBy?.id || '',
        userName: product.createdBy.userName,
      },
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<void> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['variants'],
    });
    if (!product) {
      throw new BadRequestException('Sản phẩm không tồn tại');
    }

    if (updateProductDto.variants) {
      const existingVariantIds = product.variants.map(v => v.id);
      const deleteProductVariantIds = existingVariantIds.filter(
        id => !updateProductDto.variants.some(v => v.id === id),
      );
      if (deleteProductVariantIds.length > 0) {
        await this.deleteProductVariants(deleteProductVariantIds);
        const quantityDeleted = product.variants
          .filter(v => deleteProductVariantIds.includes(v.id))
          .reduce((sum, v) => sum + v.quantity, 0);
        product.quantity -= quantityDeleted;
      }

      const updatedVariants = await this.createProductVariants(
        updateProductDto.variants.filter(v => !v.id),
        product.id,
      );
      product.variants = [
        ...product.variants.filter(v =>
          updateProductDto.variants.some(uv => uv.id === v.id),
        ),
        ...updatedVariants,
      ];
      delete updateProductDto.variants;
    }
    Object.assign(product, updateProductDto);
    await this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new BadRequestException('Sản phẩm không tồn tại');
    }
    if (product.quantity > 0 || product.quantitySold > 0) {
      product.isReleased = false;
      await this.productsRepository.save(product);
      return;
    }
    await this.productsRepository.delete(id);
  }
}
