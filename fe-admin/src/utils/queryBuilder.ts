// utils/queryBuilder.ts
import qs from "qs";

export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  search?: string;
  filters?: Record<string, any>;
}

export interface FilterOperator {
  operator:
    | "eq"
    | "gte"
    | "lte"
    | "gt"
    | "lt"
    | "like"
    | "in"
    | "between"
    | "not"
    | "exists";
  value: any;
}

export class QueryBuilder {
  private params: QueryParams = {};

  // Reset để tái sử dụng
  reset() {
    this.params = {};
    return this;
  }

  // Pagination
  page(page: number) {
    this.params.page = Math.max(1, page);
    return this;
  }

  limit(limit: number) {
    this.params.limit = Math.min(Math.max(1, limit), 100); // Max 100
    return this;
  }

  // Search
  search(term: string) {
    if (term?.trim()) {
      this.params.search = term.trim();
    }
    return this;
  }

  // Sorting
  sortBy(field: string, order: "ASC" | "DESC" = "DESC") {
    this.params.sortBy = field;
    this.params.sortOrder = order;
    return this;
  }

  // Generic filter
  filter(key: string, value: any) {
    if (!this.params.filters) {
      this.params.filters = {};
    }

    if (value !== undefined && value !== null && value !== "") {
      this.params.filters[key] = value;
    }

    return this;
  }

  // Conditional filter - chỉ add nếu condition = true
  filterIf(condition: boolean, key: string, value: any) {
    if (condition) {
      return this.filter(key, value);
    }
    return this;
  }

  // Multiple filters at once
  filters(filters: Record<string, any>) {
    Object.entries(filters).forEach(([key, value]) => {
      this.filter(key, value);
    });
    return this;
  }

  // Array filters
  filterArray(key: string, values: any[]) {
    if (values?.length) {
      return this.filter(key, values);
    }
    return this;
  }

  // Operator-based filters
  filterGte(key: string, value: any) {
    return this.filter(key, { operator: "gte", value });
  }

  filterLte(key: string, value: any) {
    return this.filter(key, { operator: "lte", value });
  }

  filterGt(key: string, value: any) {
    return this.filter(key, { operator: "gt", value });
  }

  filterLt(key: string, value: any) {
    return this.filter(key, { operator: "lt", value });
  }

  filterLike(key: string, value: string) {
    if (value?.trim()) {
      return this.filter(key, { operator: "like", value: value.trim() });
    }
    return this;
  }

  filterIn(key: string, values: any[]) {
    if (values?.length) {
      return this.filter(key, { operator: "in", value: values });
    }
    return this;
  }

  filterRange(key: string, min: any, max: any) {
    if (min !== undefined && max !== undefined) {
      return this.filter(key, { operator: "between", value: [min, max] });
    }
    return this;
  }

  filterNot(key: string, value: any) {
    return this.filter(key, { operator: "not", value });
  }

  filterExists(key: string, exists: boolean = true) {
    return this.filter(key, { operator: "exists", value: exists });
  }

  // Date helpers
  filterDateRange(
    key: string,
    startDate: string | Date,
    endDate: string | Date
  ) {
    if (startDate && endDate) {
      const start =
        typeof startDate === "string"
          ? startDate
          : startDate.toISOString().split("T")[0];
      const end =
        typeof endDate === "string"
          ? endDate
          : endDate.toISOString().split("T")[0];
      return this.filterRange(key, start, end);
    }
    return this;
  }

  filterDateAfter(key: string, date: string | Date) {
    const dateStr =
      typeof date === "string" ? date : date.toISOString().split("T")[0];
    return this.filterGte(key, dateStr);
  }

  filterDateBefore(key: string, date: string | Date) {
    const dateStr =
      typeof date === "string" ? date : date.toISOString().split("T")[0];
    return this.filterLte(key, dateStr);
  }

  // Build methods
  build(): string {
    return qs.stringify(this.params, {
      skipNulls: true,
      addQueryPrefix: true,
      arrayFormat: "brackets",
      encode: false,
    });
  }

  buildObject(): QueryParams {
    return { ...this.params };
  }

  buildWithoutPrefix(): string {
    return qs.stringify(this.params, {
      skipNulls: true,
      addQueryPrefix: false,
      arrayFormat: "brackets",
      encode: false,
    });
  }

  // Static factory methods
  static create(): QueryBuilder {
    return new QueryBuilder();
  }

  static fromObject(params: Partial<QueryParams>): QueryBuilder {
    const builder = new QueryBuilder();
    builder.params = { ...params };
    return builder;
  }

  static fromUrl(url: string): QueryBuilder {
    const parsed = qs.parse(url.split("?")[1] || "");
    return QueryBuilder.fromObject(parsed as QueryParams);
  }
}

// Utility functions
export const createQuery = () => new QueryBuilder();

export const buildQuery = (
  callback: (builder: QueryBuilder) => void
): string => {
  const builder = new QueryBuilder();
  callback(builder);
  return builder.build();
};
