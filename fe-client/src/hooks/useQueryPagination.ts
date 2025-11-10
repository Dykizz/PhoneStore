// import { useState, useCallback } from "react";
// import { QueryBuilder, type QueryParams } from "@utils/queryBuilder";
// export function useQueryBuilder(initial?: Partial<QueryParams>) {
//   // Khởi tạo state với QueryBuilder
//   const [queryBuilder, setQueryBuilder] = useState(() =>
//     QueryBuilder.create().filters(initial || {})
//   );

//   // Lấy query string
//   const getQuery = useCallback(() => queryBuilder.build(), [queryBuilder]);

//   // Set lại query bằng callback (chainable)
//   const setQuery = useCallback(
//     (callback: (qb: QueryBuilder) => QueryBuilder) => {
//       setQueryBuilder((prev) =>
//         callback(QueryBuilder.fromObject(prev.buildObject()))
//       );
//     },
//     []
//   );

//   // Set lại query bằng object
//   const setQueryObject = useCallback((params: Partial<QueryParams>) => {
//     setQueryBuilder(QueryBuilder.fromObject(params));
//   }, []);

//   // Reset về mặc định
//   const resetQuery = useCallback(() => {
//     setQueryBuilder(QueryBuilder.create());
//   }, []);

//   return {
//     queryBuilder,
//     getQuery,
//     setQuery,
//     setQueryObject,
//     resetQuery,
//   };
// }
// // Cách dùng
// // const { queryBuilder, getQuery, setQuery, setQueryObject, resetQuery } =
// //   useQueryBuilder({ page: 1, limit: 10 });

// // setQuery((qb) => qb.page(2).search("iphone").filterGte("price", 500));
// // const queryString = getQuery();
// // "?page=2&search=iphone&filters[price][operator]=gte&filters[price][value]=500"


// fe-client/src/hooks/useQueryPagination.ts

import { useState, useCallback } from "react";
import { buildQuery } from "@/utils/queryBuilder";

// Interface cho các tham số
interface QueryParams {
  [key: string]: string | number | boolean;
}

/**
 * Hook tùy chỉnh để quản lý và xây dựng các tham số truy vấn phân trang.
 * @param initialState Các giá trị ban đầu cho phân trang (ví dụ: { page: 1, limit: 10 }).
 */
export function useQueryPagination(initialState: Partial<QueryParams> = {}) {
  // Hợp nhất initialState với giá trị mặc định
  const defaultParams = {
    page: 1,
    limit: 10,
    ...initialState,
  };

  // State giữ các tham số truy vấn
  const [queryParams, setQueryParams] = useState<QueryParams>(defaultParams);

  // Khởi tạo queryString bằng cách gọi buildQuery với `defaultParams`
  const [queryString, setQueryString] = useState<string>(() =>
    buildQuery(defaultParams)
  );

  /**
   * Cập nhật các tham số truy vấn.
   * Hàm này sẽ tự động build lại chuỗi query.
   * @param newParams Các tham số mới để merge vào.
   */
  const updateQuery = useCallback((newParams: Partial<QueryParams>) => {
    setQueryParams((prevParams) => {
      const updatedParams = { ...prevParams, ...newParams };
      // Xóa các key có giá trị là undefined, null hoặc chuỗi rỗng
      Object.keys(updatedParams).forEach((key) => {
        if (
          updatedParams[key] === undefined ||
          updatedParams[key] === null ||
          updatedParams[key] === ""
        ) {
          delete updatedParams[key];
        }
      });
      // Cập nhật chuỗi query
      setQueryString(buildQuery(updatedParams));
      return updatedParams;
    });
  }, []);

  /**
   * Đặt lại các tham số truy vấn về giá trị ban đầu.
   */
  const resetQuery = useCallback(() => {
    setQueryParams(defaultParams);
    setQueryString(buildQuery(defaultParams));
  }, [defaultParams]);

  return {
    queryParams, // Đối tượng params (ví dụ: { page: 1 })
    queryString, // Chuỗi query (ví dụ: ?page=1)
    updateQuery, // Hàm để cập nhật query
    resetQuery, // Hàm để reset query
  };
}


