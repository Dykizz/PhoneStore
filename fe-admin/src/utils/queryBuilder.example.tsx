import React, { useState, useEffect } from "react";
import { QueryBuilder } from "../utils/queryBuilder";

interface Product {
  id: string;
  name: string;
  price: number;
  brand: string;
  category: string;
  storage: string;
  color: string;
  rating: number;
  inStock: boolean;
  isNew: boolean;
  createdAt: string;
  tags: string[];
}

const PhoneStoreSearch = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<any>(null);

  // All possible filters
  const [filters, setFilters] = useState({
    // Basic search
    search: "",
    page: 1,
    limit: 12,
    sortBy: "createdAt",
    sortOrder: "DESC" as "ASC" | "DESC",

    // Category filters
    brands: [] as string[],
    categories: [] as string[],
    storageOptions: [] as string[],
    colors: [] as string[],

    // Price range
    priceMin: "",
    priceMax: "",

    // Rating filter
    minRating: "",

    // Boolean filters
    inStock: null as boolean | null,
    isNew: null as boolean | null,
    hasFreeShipping: null as boolean | null,

    // Date filters
    releasedAfter: "",
    releasedBefore: "",
    dateRange: ["", ""] as [string, string],

    // Advanced filters
    tags: [] as string[],
    excludeBrands: [] as string[],
    featured: null as boolean | null,
  });

  // Fetch data với QueryBuilder
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        const query = QueryBuilder.create()
          // === BASIC PAGINATION & SEARCH ===
          .page(filters.page)
          .limit(filters.limit)
          .search(filters.search)
          .sortBy(filters.sortBy, filters.sortOrder)

          // === ARRAY FILTERS ===
          .filterArray("brand", filters.brands)
          .filterArray("category", filters.categories)
          .filterArray("storage", filters.storageOptions)
          .filterArray("color", filters.colors)
          .filterArray("tags", filters.tags)

          // === CONDITIONAL FILTERS (filterIf) ===
          .filterIf(!!filters.search, "search", filters.search)
          .filterIf(filters.inStock !== null, "inStock", filters.inStock)
          .filterIf(filters.isNew !== null, "isNew", filters.isNew)
          .filterIf(
            filters.hasFreeShipping !== null,
            "hasFreeShipping",
            filters.hasFreeShipping
          )
          .filterIf(filters.featured !== null, "featured", filters.featured)

          // === RANGE FILTERS ===
          .filterRange(
            "price",
            filters.priceMin ? parseFloat(filters.priceMin) : undefined,
            filters.priceMax ? parseFloat(filters.priceMax) : undefined
          )

          // === COMPARISON FILTERS ===
          .filterGte(
            "rating",
            filters.minRating ? parseFloat(filters.minRating) : undefined
          )
          .filterGt("stock", 0) // Always filter products with stock > 0

          // === DATE FILTERS ===
          .filterDateAfter("releasedAt", filters.releasedAfter)
          .filterDateBefore("releasedAt", filters.releasedBefore)
          .filterDateRange(
            "createdAt",
            filters.dateRange[0],
            filters.dateRange[1]
          )

          // === LIKE FILTERS ===
          .filterLike("description", filters.search)

          // === IN FILTERS ===
          .filterIn("status", ["active", "featured"])

          // === NOT FILTERS ===
          .filterNot(
            "brand",
            filters.excludeBrands.length ? filters.excludeBrands[0] : undefined
          )

          // === EXISTS FILTERS ===
          .filterExists("warranty", true)
          .filterExists("discount", filters.featured || false)

          .build();

        console.log("Generated Query:", query);

        const response = await fetch(`/api/products${query}`);
        const data = await response.json();

        setProducts(data.data);
        setMeta(data.meta);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  // Update filter helper
  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset page when filter changes
    }));
  };

  // Array filter helper
  const toggleArrayFilter = (key: string, value: string) => {
    setFilters((prev) => {
      const currentArray = prev[key as keyof typeof prev] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];

      return {
        ...prev,
        [key]: newArray,
        page: 1,
      };
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: "",
      page: 1,
      limit: 12,
      sortBy: "createdAt",
      sortOrder: "DESC",
      brands: [],
      categories: [],
      storageOptions: [],
      colors: [],
      priceMin: "",
      priceMax: "",
      minRating: "",
      inStock: null,
      isNew: null,
      hasFreeShipping: null,
      releasedAfter: "",
      releasedBefore: "",
      dateRange: ["", ""],
      tags: [],
      excludeBrands: [],
      featured: null,
    });
  };

  return (
    <div className="phone-store-search">
      <h1>Tìm kiếm điện thoại</h1>

      {/* === SEARCH BAR === */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="search-input"
        />

        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split("-");
            updateFilter("sortBy", sortBy);
            updateFilter("sortOrder", sortOrder);
          }}
        >
          <option value="createdAt-DESC">Mới nhất</option>
          <option value="price-ASC">Giá tăng dần</option>
          <option value="price-DESC">Giá giảm dần</option>
          <option value="rating-DESC">Đánh giá cao nhất</option>
          <option value="name-ASC">Tên A-Z</option>
        </select>
      </div>

      <div className="filters-container">
        {/* === BRAND FILTERS (Array) === */}
        <div className="filter-group">
          <h3>Thương hiệu</h3>
          {["Apple", "Samsung", "Xiaomi", "Oppo", "Vivo"].map((brand) => (
            <label key={brand}>
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => toggleArrayFilter("brands", brand)}
              />
              {brand}
            </label>
          ))}
        </div>

        {/* === CATEGORY FILTERS === */}
        <div className="filter-group">
          <h3>Danh mục</h3>
          {["smartphone", "tablet", "smartwatch", "accessory"].map(
            (category) => (
              <label key={category}>
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={() => toggleArrayFilter("categories", category)}
                />
                {category}
              </label>
            )
          )}
        </div>

        {/* === PRICE RANGE === */}
        <div className="filter-group">
          <h3>Khoảng giá</h3>
          <input
            type="number"
            placeholder="Giá từ"
            value={filters.priceMin}
            onChange={(e) => updateFilter("priceMin", e.target.value)}
          />
          <input
            type="number"
            placeholder="Giá đến"
            value={filters.priceMax}
            onChange={(e) => updateFilter("priceMax", e.target.value)}
          />
        </div>

        {/* === RATING FILTER === */}
        <div className="filter-group">
          <h3>Đánh giá tối thiểu</h3>
          <select
            value={filters.minRating}
            onChange={(e) => updateFilter("minRating", e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="1">1 sao trở lên</option>
            <option value="2">2 sao trở lên</option>
            <option value="3">3 sao trở lên</option>
            <option value="4">4 sao trở lên</option>
            <option value="5">5 sao</option>
          </select>
        </div>

        {/* === BOOLEAN FILTERS === */}
        <div className="filter-group">
          <h3>Trạng thái</h3>

          <select
            value={filters.inStock === null ? "" : filters.inStock.toString()}
            onChange={(e) =>
              updateFilter(
                "inStock",
                e.target.value === "" ? null : e.target.value === "true"
              )
            }
          >
            <option value="">Tất cả</option>
            <option value="true">Còn hàng</option>
            <option value="false">Hết hàng</option>
          </select>

          <select
            value={filters.isNew === null ? "" : filters.isNew.toString()}
            onChange={(e) =>
              updateFilter(
                "isNew",
                e.target.value === "" ? null : e.target.value === "true"
              )
            }
          >
            <option value="">Tất cả</option>
            <option value="true">Sản phẩm mới</option>
            <option value="false">Sản phẩm cũ</option>
          </select>

          <label>
            <input
              type="checkbox"
              checked={filters.featured || false}
              onChange={(e) =>
                updateFilter("featured", e.target.checked ? true : null)
              }
            />
            Sản phẩm nổi bật
          </label>
        </div>

        {/* === DATE FILTERS === */}
        <div className="filter-group">
          <h3>Ngày phát hành</h3>
          <input
            type="date"
            value={filters.releasedAfter}
            onChange={(e) => updateFilter("releasedAfter", e.target.value)}
            placeholder="Từ ngày"
          />
          <input
            type="date"
            value={filters.releasedBefore}
            onChange={(e) => updateFilter("releasedBefore", e.target.value)}
            placeholder="Đến ngày"
          />
        </div>

        {/* === STORAGE OPTIONS === */}
        <div className="filter-group">
          <h3>Bộ nhớ</h3>
          {["64GB", "128GB", "256GB", "512GB", "1TB"].map((storage) => (
            <label key={storage}>
              <input
                type="checkbox"
                checked={filters.storageOptions.includes(storage)}
                onChange={() => toggleArrayFilter("storageOptions", storage)}
              />
              {storage}
            </label>
          ))}
        </div>

        {/* === EXCLUDE BRANDS === */}
        <div className="filter-group">
          <h3>Loại trừ thương hiệu</h3>
          <select
            value={filters.excludeBrands[0] || ""}
            onChange={(e) =>
              updateFilter(
                "excludeBrands",
                e.target.value ? [e.target.value] : []
              )
            }
          >
            <option value="">Không loại trừ</option>
            <option value="Apple">Loại trừ Apple</option>
            <option value="Samsung">Loại trừ Samsung</option>
          </select>
        </div>

        {/* === RESET BUTTON === */}
        <button onClick={resetFilters} className="reset-button">
          Reset tất cả bộ lọc
        </button>
      </div>

      {/* === RESULTS === */}
      <div className="results-section">
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <>
            <div className="results-info">
              <p>Tìm thấy {meta?.total || 0} sản phẩm</p>
              <p>
                Trang {meta?.page || 1} / {meta?.totalPages || 1}
              </p>
            </div>

            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <h3>{product.name}</h3>
                  <p>Giá: {product.price.toLocaleString()} VND</p>
                  <p>Thương hiệu: {product.brand}</p>
                  <p>Đánh giá: {product.rating}/5</p>
                  <p>Trạng thái: {product.inStock ? "Còn hàng" : "Hết hàng"}</p>
                  {product.isNew && <span className="new-badge">Mới</span>}
                </div>
              ))}
            </div>

            {/* === PAGINATION === */}
            <div className="pagination">
              <button
                onClick={() => updateFilter("page", filters.page - 1)}
                disabled={filters.page === 1}
              >
                Previous
              </button>

              <span>Trang {filters.page}</span>

              <button
                onClick={() => updateFilter("page", filters.page + 1)}
                disabled={!meta?.hasNext}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PhoneStoreSearch;
