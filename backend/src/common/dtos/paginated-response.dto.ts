import { MetaDto } from './pagination-meta.dto';

export class PaginatedResponseDto<T> {
  data: T[];
  meta: MetaDto;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.meta = new MetaDto(total, page, limit);
  }
}
