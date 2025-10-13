import { Type, Transform } from 'class-transformer';
import {
  IsOptional,
  IsPositive,
  Min,
  Max,
  IsString,
  IsEnum,
  IsObject,
} from 'class-validator';
import * as qs from 'qs';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: 'Số trang phải là số dương' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: 'Giới hạn tối thiểu là 1' })
  @Max(100, { message: 'Giới hạn tối đa là 100' })
  limit: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(SortOrder, { message: 'Thứ tự sắp xếp phải là "ASC" hoặc "DESC"' })
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsString()
  search?: string;

  // Sử dụng qs để parse complex filters
  @IsOptional()
  @IsObject()
  @Transform(({ value, obj }) => {
    // Nếu value đã là object (từ qs parsing), return trực tiếp
    if (typeof value === 'object' && value !== null) {
      return value;
    }

    // Nếu value là string, parse với qs hoặc JSON
    if (typeof value === 'string') {
      try {
        // Thử parse JSON trước
        return JSON.parse(value);
      } catch {
        // Nếu không phải JSON, thử parse với qs
        try {
          return qs.parse(value);
        } catch {
          return {};
        }
      }
    }

    return value || {};
  })
  filters?: Record<string, any> = {};

  /**
   * Static method để parse toàn bộ query string với qs
   */
  static fromQueryString(queryString: string): Partial<PaginationQueryDto> {
    const parsed = qs.parse(queryString, {
      parseArrays: true,
      allowDots: true,
      depth: 10,
      arrayLimit: 100,
    });

    return {
      page: parsed.page ? Number(parsed.page) : 1,
      limit: parsed.limit ? Number(parsed.limit) : 10,
      sortBy: parsed.sortBy as string,
      sortOrder: parsed.sortOrder as SortOrder,
      search: parsed.search as string,
      filters: (parsed.filters as Record<string, any>) || {},
    };
  }

  /**
   * Apply search và filters vào QueryBuilder
   */
  applyToQueryBuilder(
    qb: any,
    alias: string,
    searchFields?: string[],
    validSortFields?: string[],
  ) {
    // Apply search
    if (this.search && searchFields?.length) {
      const searchConditions = searchFields
        .map(field => `${alias}.${field} ILIKE :search`)
        .join(' OR ');

      qb.andWhere(`(${searchConditions})`, {
        search: `%${this.search}%`,
      });
    }

    // Apply filters (với qs parsing support)
    if (this.filters && Object.keys(this.filters).length > 0) {
      this.applyFiltersToQueryBuilder(qb, alias, this.filters);
    }

    // Apply sorting
    const allowedSortFields = validSortFields || ['createdAt'];
    const sortField = allowedSortFields.includes(this.sortBy)
      ? this.sortBy
      : allowedSortFields[0];

    qb.orderBy(`${alias}.${sortField}`, this.sortOrder);

    // Apply pagination
    qb.skip((this.page - 1) * this.limit).take(this.limit);

    return qb;
  }

  /**
   * Apply filters với nested objects support (from qs)
   */
  private applyFiltersToQueryBuilder(
    qb: any,
    alias: string,
    filters: Record<string, any>,
  ) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Handle nested objects (từ qs parsing)
        if (
          typeof value === 'object' &&
          !Array.isArray(value) &&
          !value.operator
        ) {
          // Nested filter: filters[user][role] = admin
          this.applyNestedFilter(qb, alias, key, value);
        }
        // Handle arrays
        else if (Array.isArray(value)) {
          qb.andWhere(`${alias}.${key} IN (:...${key})`, { [key]: value });
        }
        // Handle advanced filters với operators
        else if (typeof value === 'object' && value.operator) {
          this.applyAdvancedFilter(qb, alias, key, value);
        }
        // Handle simple equality
        else {
          qb.andWhere(`${alias}.${key} = :${key}`, { [key]: value });
        }
      }
    });
  }

  /**
   * Apply nested filters (qs parsing result)
   */
  private applyNestedFilter(
    qb: any,
    alias: string,
    parentKey: string,
    nestedFilters: Record<string, any>,
  ) {
    Object.entries(nestedFilters).forEach(([nestedKey, nestedValue]) => {
      const fullKey = `${parentKey}_${nestedKey}`;

      if (Array.isArray(nestedValue)) {
        qb.andWhere(`${alias}.${parentKey} IN (:...${fullKey})`, {
          [fullKey]: nestedValue,
        });
      } else if (typeof nestedValue === 'object' && nestedValue.operator) {
        this.applyAdvancedFilter(qb, alias, parentKey, nestedValue);
      } else {
        qb.andWhere(`${alias}.${parentKey} = :${fullKey}`, {
          [fullKey]: nestedValue,
        });
      }
    });
  }

  /**
   * Apply advanced filters với operators
   */
  private applyAdvancedFilter(
    qb: any,
    alias: string,
    key: string,
    filter: any,
  ) {
    const { operator, value } = filter;
    const paramKey = `${key}_${operator}_${Math.random().toString(36).substr(2, 9)}`;

    switch (operator) {
      case 'gte':
        qb.andWhere(`${alias}.${key} >= :${paramKey}`, { [paramKey]: value });
        break;
      case 'lte':
        qb.andWhere(`${alias}.${key} <= :${paramKey}`, { [paramKey]: value });
        break;
      case 'gt':
        qb.andWhere(`${alias}.${key} > :${paramKey}`, { [paramKey]: value });
        break;
      case 'lt':
        qb.andWhere(`${alias}.${key} < :${paramKey}`, { [paramKey]: value });
        break;
      case 'like':
        qb.andWhere(`${alias}.${key} ILIKE :${paramKey}`, {
          [paramKey]: `%${value}%`,
        });
        break;
      case 'in':
        qb.andWhere(`${alias}.${key} IN (:...${paramKey})`, {
          [paramKey]: Array.isArray(value) ? value : [value],
        });
        break;
      case 'between':
        if (Array.isArray(value) && value.length === 2) {
          qb.andWhere(
            `${alias}.${key} BETWEEN :${paramKey}_start AND :${paramKey}_end`,
            {
              [`${paramKey}_start`]: value[0],
              [`${paramKey}_end`]: value[1],
            },
          );
        }
        break;
      default:
        qb.andWhere(`${alias}.${key} = :${paramKey}`, { [paramKey]: value });
    }
  }

  /**
   * Convert to query string với qs
   */
  toQueryString(): string {
    return qs.stringify(
      {
        page: this.page,
        limit: this.limit,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
        search: this.search,
        filters: this.filters,
      },
      {
        skipNulls: true,
        addQueryPrefix: true,
        arrayFormat: 'brackets',
        encode: false,
      },
    );
  }
}
