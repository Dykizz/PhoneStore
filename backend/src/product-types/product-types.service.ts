import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductType } from './entities/product-type.entity';
import { Repository } from 'typeorm';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

@Injectable()
export class ProductTypesService {
  constructor(
    @InjectRepository(ProductType)
    private readonly productTypesRepository: Repository<ProductType>,
  ) {}
  async create(createProductTypeDto: CreateProductTypeDto) {
    const { name, description } = createProductTypeDto;
    const existingProductType = await this.productTypesRepository.findOne({
      where: { name },
    });

    if (existingProductType) {
      throw new BadRequestException('Loại sản phẩm đã tồn tại');
    }

    const productType = this.productTypesRepository.create({
      name,
      description,
    });
    return await this.productTypesRepository.save(productType);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ProductType>> {
    const searchFields = ['name'];
    const validSortFields = ['name', 'createdAt', 'updatedAt'];

    const queryBuilder =
      this.productTypesRepository.createQueryBuilder('product-types');
    if (query.page < 1) query.page = 1;
    if (query.limit < 1) query.limit = 10;
    const skip = (query.page - 1) * query.limit;

    query.applyToQueryBuilder(
      queryBuilder,
      'product-types',
      searchFields,
      validSortFields,
    );
    const [items, total] = await queryBuilder
      .skip(skip)
      .take(query.limit)
      .getManyAndCount();

    return new PaginatedResponseDto(items, total, query.page, query.limit);
  }

  async update(
    id: string,
    updateProductTypeDto: UpdateProductTypeDto,
  ): Promise<ProductType> {
    const productType = await this.productTypesRepository.findOne({
      where: { id },
    });
    if (!productType) {
      throw new BadRequestException('Loại sản phẩm không tồn tại');
    }
    Object.assign(productType, updateProductTypeDto);
    await this.productTypesRepository.save(productType);
    return productType;
  }

  async remove(id: string): Promise<void> {
    const productType = await this.productTypesRepository.findOne({
      where: { id },
    });
    if (!productType) {
      throw new BadRequestException('Loại sản phẩm không tồn tại');
    }
    await this.productTypesRepository.remove(productType);
  }
}
