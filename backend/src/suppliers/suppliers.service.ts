import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly suppliersRepository: Repository<Supplier>,
  ) {}
  async createSupplier(createSupplierDto: CreateSupplierDto) {
    const { name, description } = createSupplierDto;
    const existingSupplier = await this.suppliersRepository.findOne({
      where: { name },
    });

    if (existingSupplier) {
      throw new BadRequestException('Nhà cung cấp đã tồn tại');
    }

    const supplier = this.suppliersRepository.create({
      name,
      description,
    });
    return await this.suppliersRepository.save(supplier);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Supplier>> {
    const searchFields = ['name'];
    const validSortFields = ['name', 'createdAt', 'updatedAt'];

    const queryBuilder =
      this.suppliersRepository.createQueryBuilder('supplier');
    if (query.page < 1) query.page = 1;
    if (query.limit < 1) query.limit = 10;
    const skip = (query.page - 1) * query.limit;

    query.applyToQueryBuilder(
      queryBuilder,
      'supplier',
      searchFields,
      validSortFields,
    );
    const [items, total] = await queryBuilder
      .skip(skip)
      .take(query.limit)
      .getManyAndCount();

    return new PaginatedResponseDto(items, total, query.page, query.limit);
  }

  async updateSupplier(
    id: string,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<Supplier> {
    const supplier = await this.suppliersRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new BadRequestException('Nhà cung cấp không tồn tại');
    }
    Object.assign(supplier, updateSupplierDto);
    await this.suppliersRepository.save(supplier);
    return supplier;
  }

  async remove(id: string): Promise<void> {
    const supplier = await this.suppliersRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new BadRequestException('Nhà cung cấp không tồn tại');
    }
    await this.suppliersRepository.remove(supplier);
  }
}
