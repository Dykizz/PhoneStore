import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandsRepository: Repository<Brand>,
    private readonly uploadService: UploadService,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    const { name, description, image } = createBrandDto;
    const existingBrand = await this.brandsRepository.findOne({
      where: { name },
    });

    if (existingBrand) {
      throw new BadRequestException('Thương hiệu đã tồn tại');
    }

    const brand = this.brandsRepository.create({
      name,
      description,
      image,
    });
    return await this.brandsRepository.save(brand);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Brand>> {
    const searchFields = ['name'];
    const validSortFields = ['name', 'createdAt', 'updatedAt'];

    const queryBuilder = this.brandsRepository.createQueryBuilder('brand');
    if (query.page < 1) query.page = 1;
    if (query.limit < 1) query.limit = 10;
    const skip = (query.page - 1) * query.limit;

    query.applyToQueryBuilder(
      queryBuilder,
      'brand',
      searchFields,
      validSortFields,
    );
    const [items, total] = await queryBuilder
      .skip(skip)
      .take(query.limit)
      .getManyAndCount();

    return new PaginatedResponseDto(items, total, query.page, query.limit);
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandsRepository.findOne({
      where: { id },
    });
    if (!brand) {
      throw new BadRequestException('Thương hiệu không tồn tại');
    }
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.brandsRepository.findOne({ where: { id } });
    if (!brand) {
      throw new BadRequestException('Thương hiệu không tồn tại');
    }
    if (updateBrandDto.image) {
      this.uploadService.deleteMultipleImagesByUrls([brand.image]);
    }
    Object.assign(brand, updateBrandDto);
    await this.brandsRepository.save(brand);
    return brand;
  }

  async remove(id: string): Promise<void> {
    const brand = await this.brandsRepository.findOne({ where: { id } });
    if (!brand) {
      throw new BadRequestException('Thương hiệu không tồn tại');
    }
    if (brand.image) {
      this.uploadService.deleteMultipleImagesByUrls([brand.image]);
    }
    await this.brandsRepository.remove(brand);
  }
}
