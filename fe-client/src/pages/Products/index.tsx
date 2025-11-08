"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { getProducts } from "@/apis/product.api";
import { getBrands } from "@/apis/brand.api";
import { getProductTypes } from "@/apis/productType.api";
import type { BaseProduct } from "@/types/product.type";
import type { Brand } from "@/types/brand.type";
import type { ProductType } from "@/types/productType.type";
import { QueryBuilder } from "@/utils/queryBuilder";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

export default function ProductsPage() {
  // ===== STATE =====
  const [products, setProducts] = useState<BaseProduct[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [types, setTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 8;

  // Bộ lọc
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>(
    {}
  );
  const [searchText, setSearchText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt_DESC");

  // ===== MAP =====
  const brandMap = useMemo(() => {
    const map = new Map<string, string>();
    brands.forEach((b) => map.set(b.id, b.name));
    return map;
  }, [brands]);

  const typeMap = useMemo(() => {
    const map = new Map<string, string>();
    types.forEach((t) => map.set(t.id, t.name));
    return map;
  }, [types]);

  // ===== LABEL =====
  const brandLabel = selectedBrand
    ? brandMap.get(selectedBrand) ?? "Không rõ"
    : "Hãng sản xuất";
  const typeLabel = selectedType
    ? typeMap.get(selectedType) ?? "Không rõ"
    : "Loại sản phẩm";
  const priceLabel =
    priceRange.min || priceRange.max
      ? `Giá: ${(priceRange.min ?? 0).toLocaleString("vi-VN")} - ${
          (priceRange.max ?? Infinity) === Infinity
            ? "∞"
            : (priceRange.max ?? 0).toLocaleString("vi-VN")
        }`
      : "Khoảng giá";

  // ===== LOAD FILTER SOURCES =====
  useEffect(() => {
    (async () => {
      try {
        const [bRes, tRes] = await Promise.all([
          getBrands("?page=1&limit=100"),
          getProductTypes("?page=1&limit=100"),
        ]);
        if (bRes.success) setBrands(bRes.data.data);
        if (tRes.success) setTypes(tRes.data.data);
      } catch (e) {
        console.error("⚠️ Lỗi tải filter options:", e);
      }
    })();
  }, []);

  // ===== FETCH PRODUCTS =====
  const fetchProducts = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);

      try {
        const [sortField, rawOrder] = sortBy.split("_");
        const sortOrder = rawOrder as "ASC" | "DESC";

        const qb = QueryBuilder.create()
          .page(page)
          .limit(itemsPerPage)
          .filter("filters[isReleased]", true)
          .filterIf(!!selectedBrand, "filters[brandId]", selectedBrand)
          .filterIf(!!selectedType, "filters[productTypeId]", selectedType)
          .sortBy(sortField, sortOrder);

        if (priceRange.min !== undefined)
          qb.filter("filters[price][gte]", priceRange.min);
        if (priceRange.max !== undefined)
          qb.filter("filters[price][lte]", priceRange.max);

        if (searchQuery.trim()) qb.search(searchQuery);

        const query = qb.build();
        console.log("🔍 Query gửi lên:", query);

        const res = await getProducts(query);

        if (res.success && res.data) {
          setProducts(res.data.data);
          setTotalPages(res.data.meta?.totalPages ?? 1);
        } else {
          setError(res.message || "Không thể tải dữ liệu sản phẩm");
        }
      } catch (err: any) {
        console.error("🚨 Lỗi gọi API:", err);
        setError(err?.message || "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    },
    [selectedBrand, selectedType, priceRange, searchQuery, sortBy]
  );

  // ===== FETCH WHEN FILTERS CHANGE =====
  useEffect(() => {
    fetchProducts(currentPage);
  }, [fetchProducts, currentPage]);

  // ===== HANDLERS =====
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCurrentPage(1);
      setSearchQuery(searchText);
    }
  };

  const resetFilters = () => {
    setSelectedBrand(null);
    setSelectedType(null);
    setPriceRange({});
    setSearchText("");
    setSearchQuery("");
    setSortBy("createdAt_DESC");
    setCurrentPage(1);
  };

  // ===== UI STATES =====
  if (loading)
    return (
      <div className="flex justify-center items-center h-96 text-gray-600 text-lg">
        Đang tải sản phẩm...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-96 text-red-500 text-lg">
        {error}
      </div>
    );

  // ===== RENDER =====
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ==== FILTER BAR ==== */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-5 mb-10">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-black" />
            <h2 className="font-semibold text-gray-900 text-lg">
              Bộ lọc sản phẩm
            </h2>
          </div>
          <Button
            variant="outline"
            onClick={resetFilters}
            className="rounded-full text-sm border-gray-300 text-gray-800 hover:bg-gray-100"
          >
            Đặt lại
          </Button>
        </div>

        {/* ==== FILTERS ==== */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search rộng hơn */}
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            className="w-80 text-sm"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleSearchKey}
          />

          {/* Giá */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full text-sm border-gray-300 text-gray-800"
              >
                {priceLabel}
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => setPriceRange({})}>
                Tất cả giá
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setPriceRange({ max: 15000000 })}
              >
                Dưới 15 triệu
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setPriceRange({ min: 15000000, max: 25000000 })}
              >
                15 – 25 triệu
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setPriceRange({ min: 25000000 })}
              >
                Trên 25 triệu
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Loại */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full text-sm border-gray-300 text-gray-800"
              >
                {typeLabel}
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-64 max-h-72 overflow-auto"
            >
              <DropdownMenuItem onClick={() => setSelectedType(null)}>
                Tất cả loại
              </DropdownMenuItem>
              {types.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                >
                  {t.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hãng */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full text-sm border-gray-300 text-gray-800"
              >
                {brandLabel}
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-64 max-h-72 overflow-auto"
            >
              <DropdownMenuItem onClick={() => setSelectedBrand(null)}>
                Tất cả hãng
              </DropdownMenuItem>
              {brands.map((b) => (
                <DropdownMenuItem
                  key={b.id}
                  onClick={() => setSelectedBrand(b.id)}
                >
                  {b.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sắp xếp */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full text-sm border-gray-300 text-gray-800"
              >
                Sắp xếp
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuItem onClick={() => setSortBy("createdAt_DESC")}>
                Mới nhất
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("price_ASC")}>
                Giá tăng dần
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("price_DESC")}>
                Giá giảm dần
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ==== PRODUCT LIST ==== */}
      <AnimatePresence mode="wait">
        {products.length > 0 ? (
          <motion.div
            key={currentPage + JSON.stringify(priceRange) + selectedBrand + selectedType + sortBy + searchQuery}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {products.map((p) => {
              const hasDiscount = !!p.discount?.discountPercent;
              const discountPercent = p.discount?.discountPercent ?? 0;
              const basePrice = Number(p.price);
              const finalPrice = hasDiscount
                ? Math.round(basePrice * (1 - discountPercent / 100))
                : basePrice;
              const imageUrl = p.variants?.[0]?.image ?? "/placeholder.png";

              return (
                <Card
                  key={p.id}
                  className="overflow-hidden border border-gray-200 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  <Link to={`/products/${p.id}`}>
                    <CardHeader className="p-0 relative h-64 flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt={p.name}
                        className="object-contain w-full h-full p-4 transition-transform duration-500 hover:scale-110"
                      />
                      {hasDiscount && (
                        <span className="absolute top-2 left-2 bg-black text-white text-[11px] px-2 py-1 rounded-md shadow-sm">
                          -{discountPercent}%
                        </span>
                      )}
                    </CardHeader>
                  </Link>

                  <CardContent className="p-4 text-center">
                    <CardTitle className="text-base font-semibold mb-2 line-clamp-2 text-gray-900 hover:text-black transition-colors">
                      {p.name}
                    </CardTitle>

                    <div className="flex flex-col items-center">
                      <span className="text-black font-bold text-xl">
                        {finalPrice.toLocaleString("vi-VN")}₫
                      </span>
                      {hasDiscount && (
                        <span className="text-gray-400 text-sm line-through">
                          {basePrice.toLocaleString("vi-VN")}₫
                        </span>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="px-4 pb-4">
                    <Link to={`/products/${p.id}`} className="w-full">
                      <Button className="w-full text-sm py-2.5 font-medium text-white bg-black hover:bg-gray-900 rounded-full shadow-md">
                        Xem chi tiết
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </motion.div>
        ) : (
          // === EMPTY STATE ===
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-gray-300 rounded-2xl bg-gray-50"
          >
            {/* Icon bounce 📦 */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <span className="text-6xl">📦</span>
            </motion.div>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
              Không tìm thấy sản phẩm phù hợp
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Hãy thử thay đổi bộ lọc hoặc tìm kiếm khác nhé!
            </p>
            <Button
              variant="outline"
              className="rounded-full border-gray-300 text-gray-800 hover:bg-gray-100"
              onClick={resetFilters}
            >
              Đặt lại bộ lọc
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==== PAGINATION ==== */}
      <div className="mt-10 flex flex-col items-center gap-4">
        {/* Bộ nút phân trang */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="rounded-full px-5 py-2 text-sm border-gray-300 text-gray-800 hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
          >
            <span>←</span>
            <span>Trang trước</span>
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 ${
                  page === currentPage
                    ? "bg-black text-white hover:bg-gray-900"
                    : "text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="rounded-full px-5 py-2 text-sm border-gray-300 text-gray-800 hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
          >
            <span>Trang sau</span>
            <span>→</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
