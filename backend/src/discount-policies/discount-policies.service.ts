import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDiscountPolicyDto } from './dto/create-discount-policy.dto';
import { UpdateDiscountPolicyDto } from './dto/update-discount-policy.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscountPolicy } from './entities/discount-policy.entity';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';

@Injectable()
export class DiscountPoliciesService {
  constructor(
    @InjectRepository(DiscountPolicy)
    private readonly discountPoliciesRepository: Repository<DiscountPolicy>,
  ) {}

  async createDiscountPolicy(createDiscountPolicyDto: CreateDiscountPolicyDto) {
    const supplier = this.discountPoliciesRepository.create(
      createDiscountPolicyDto,
    );
    await this.discountPoliciesRepository.save(supplier);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<DiscountPolicy>> {
    const searchFields = ['name'];
    const validSortFields = [
      'name',
      'createdAt',
      'updatedAt',
      'discountPercent',
      'startDate',
      'endDate',
    ];

    const queryBuilder =
      this.discountPoliciesRepository.createQueryBuilder('discount_policies');
    if (query.page < 1) query.page = 1;
    if (query.limit < 1) query.limit = 10;
    const skip = (query.page - 1) * query.limit;

    query.applyToQueryBuilder(
      queryBuilder,
      'discount_policies',
      searchFields,
      validSortFields,
    );
    const [items, total] = await queryBuilder
      .skip(skip)
      .take(query.limit)
      .getManyAndCount();

    return new PaginatedResponseDto(items, total, query.page, query.limit);
  }

  async updateDiscountPolicy(
    id: string,
    updateDiscountPolicyDto: UpdateDiscountPolicyDto,
  ) {
    const discountPolicy = await this.discountPoliciesRepository.findOne({
      where: { id },
    });
    if (!discountPolicy) {
      throw new BadRequestException('Chính sách giảm giá không tồn tại');
    }
    Object.assign(discountPolicy, updateDiscountPolicyDto);
    await this.discountPoliciesRepository.save(discountPolicy);
  }

  async removeDiscountPolicy(id: string): Promise<void> {
    const discountPolicy = await this.discountPoliciesRepository.findOne({
      where: { id },
    });
    if (!discountPolicy) {
      throw new BadRequestException('Chính sách giảm giá không tồn tại');
    }
    await this.discountPoliciesRepository.remove(discountPolicy);
  }
}
