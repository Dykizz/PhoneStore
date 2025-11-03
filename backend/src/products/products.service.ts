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
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly productVariantsRepository: Repository<ProductVariant>,
    private readonly uploadService: UploadService,
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
    const variants = await this.productVariantsRepository.find({
      where: { id: In(ids) },
    });

    if (variants.length === 0) {
      console.log('No variants found to delete');
      return;
    }

    const hasQuantity = variants.some(v => v.quantity > 0);
    if (hasQuantity) {
      throw new BadRequestException(
        'Không thể xóa variant có số lượng tồn kho. Vui lòng xuất hết hàng trước khi xóa.',
      );
    }

    const imageUrls = variants
      .map(v => v.image)
      .filter(url => url && url.trim() !== '');

    if (imageUrls.length > 0) {
      try {
        await this.uploadService.deleteMultipleImagesByUrls(imageUrls);
      } catch (error) {
        console.error('Error deleting images:', error);
      }
    }
    await this.productVariantsRepository.delete(ids);
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

    if (!createProductDto.variants || createProductDto.variants.length === 0) {
      throw new BadRequestException('Sản phẩm phải có ít nhất một biến thể');
    }
    const newProduct = this.productsRepository.create({
      name: createProductDto.name,
      baseDescription: createProductDto.baseDescription,
      detailDescription: createProductDto.detailDescription,
      price: createProductDto.price,
      isReleased: createProductDto.isReleased,
      brandId: createProductDto.brandId,
      productTypeId: createProductDto.productTypeId,
      discountPolicyId: createProductDto.discountPolicyId,
      createdById: user.id,
      quantity: 0,
    });

    const savedProduct = await this.productsRepository.save(newProduct);

    if (createProductDto.variants && createProductDto.variants.length > 0) {
      const variantsToCreate = createProductDto.variants.map(v => ({
        color: v.color,
        image: v.image,
        quantity: 0,
        productId: savedProduct.id,
      }));

      await this.productVariantsRepository.save(variantsToCreate);
    }

    const productWithVariants = await this.productsRepository.findOne({
      where: { id: savedProduct.id },
      relations: ['variants'],
    });

    return this.mapEntityToBaseicInfo(productWithVariants);
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

    if (updateProductDto.variants && updateProductDto.variants.length > 0) {
      const incomingVariants = updateProductDto.variants;

      const incomingVariantIds = incomingVariants
        .filter(v => v.id)
        .map(v => v.id);

      const variantsToDelete = product.variants
        .filter(v => !incomingVariantIds.includes(v.id))
        .map(v => v.id);

      if (variantsToDelete.length > 0) {
        await this.deleteProductVariants(variantsToDelete);
      }

      for (const variantDto of incomingVariants) {
        if (variantDto.id) {
          const existingVariant = product.variants.find(
            v => v.id === variantDto.id,
          );
          if (existingVariant) {
            const hasChanges =
              existingVariant.color !== variantDto.color ||
              existingVariant.image !== variantDto.image;

            if (hasChanges) {
              await this.productVariantsRepository.update(variantDto.id, {
                color: variantDto.color,
                image: variantDto.image,
              });
            }
          }
        } else {
          const newVariant = this.productVariantsRepository.create({
            color: variantDto.color,
            image: variantDto.image,
            quantity: 0,
            productId: product.id,
          });
          await this.productVariantsRepository.save(newVariant);
        }
      }
      delete updateProductDto.variants;
    } else {
      throw new BadRequestException('Sản phẩm phải có ít nhất 1 biến thể');
    }
    await this.productsRepository.update(id, updateProductDto);
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
