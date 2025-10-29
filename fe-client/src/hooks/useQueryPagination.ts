import { useState, useCallback } from "react";
import { QueryBuilder, type QueryParams } from "@/utils/queryBuilder";
export function useQueryBuilder(initial?: Partial<QueryParams>) {
  // Khởi tạo state với QueryBuilder
  const [queryBuilder, setQueryBuilder] = useState(() =>
    QueryBuilder.create().filters(initial || {})
  );

  // Lấy query string
  const getQuery = useCallback(() => queryBuilder.build(), [queryBuilder]);

  // Set lại query bằng callback (chainable)
  const setQuery = useCallback(
    (callback: (qb: QueryBuilder) => QueryBuilder) => {
      setQueryBuilder((prev) =>
        callback(QueryBuilder.fromObject(prev.buildObject()))
      );
    },
    []
  );

  // Set lại query bằng object
  const setQueryObject = useCallback((params: Partial<QueryParams>) => {
    setQueryBuilder(QueryBuilder.fromObject(params));
  }, []);

  // Reset về mặc định
  const resetQuery = useCallback(() => {
    setQueryBuilder(QueryBuilder.create());
  }, []);

  return {
    queryBuilder,
    getQuery,
    setQuery,
    setQueryObject,
    resetQuery,
  };
}
// Cách dùng
// const { queryBuilder, getQuery, setQuery, setQueryObject, resetQuery } =
//   useQueryBuilder({ page: 1, limit: 10 });

// setQuery((qb) => qb.page(2).search("iphone").filterGte("price", 500));
// const queryString = getQuery();
// "?page=2&search=iphone&filters[price][operator]=gte&filters[price][value]=500"
