import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BaseProduct } from "@/types/product.type";
import { showToast } from "@/utils/toast";
import { QueryBuilder } from "@/utils/queryBuilder";
import type { Brand } from "@/types/brand.type";
import { getBrands } from "@/apis/brand.api";
import { getProducts } from "@/apis/product.api";
import type { MetaPagination } from "@/interfaces/pagination.interface";
import ProductLoading from "./ProductLoading";
import Product from "./Product";
import ProductFilter from "./ProductFilter";
import ProductEmpty from "./ProductEmpty";
import ProductPagination from "./ProductPagination";
import { useSearchParams } from "react-router-dom";
import { Package, Phone } from "lucide-react";

const defautFilter = {
  priceMin: undefined,
  priceMax: undefined,
  brandId: undefined,
  productTypeId: "ebd5e145-d7eb-4cd0-80bc-e71e0a623c76",
  sortBy: "",
  sortOrder: "DESC" as "ASC" | "DESC",
  searchText: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<BaseProduct[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<MetaPagination>({
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "phone";

  const [searchText, setSearchText] = useState<string>(
    search || defautFilter.searchText
  );
  const [priceMin, setPriceMin] = useState<number | undefined>(
    defautFilter.priceMin
  );
  const [priceMax, setPriceMax] = useState<number | undefined>(
    defautFilter.priceMax
  );
  const [brandId, setBrandId] = useState<string | undefined>(
    defautFilter.brandId
  );
  const [productTypeId, setProductTypeId] = useState<string | undefined>(
    category === "accessory"
      ? "95ea2006-b528-4d15-81b6-2a4ac723fa09"
      : "ebd5e145-d7eb-4cd0-80bc-e71e0a623c76"
  );

  const [sortBy, setSortBy] = useState<string>(defautFilter.sortBy);
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">(
    defautFilter.sortOrder
  );

  const handleDefaultFilter = () => {
    setSearchText(defautFilter.searchText);
    setPriceMin(defautFilter.priceMin);
    setPriceMax(defautFilter.priceMax);
    setBrandId(defautFilter.brandId);
    setProductTypeId(defautFilter.productTypeId);
    setSortBy(defautFilter.sortBy);
    setSortOrder(defautFilter.sortOrder);
  };
  const mapBrands = useMemo(() => {
    const map = new Map<string, string>();
    brands.forEach((brand) => map.set(brand.id, brand.name));
    return map;
  }, [brands]);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const query = QueryBuilder.create()
        .page(page)
        .limit(pagination.limit)
        .search(searchText)
        .filterIf(!!priceMin, "price", { gte: priceMin })
        .filterIf(!!priceMax, "price", { lte: priceMax })
        .filterIf(!!brandId, "brandId", brandId)
        .filterIf(!!productTypeId, "productTypeId", productTypeId)
        .sortBy(sortBy, sortOrder)
        .build();

      const response = await getProducts(query);

      if (response.success) {
        setProducts(response.data.data);
        setPagination(response.data.meta);
      } else {
        showToast({
          type: "error",
          description: "Không thể tải danh sách sản phẩm",
          title: "Lỗi",
        });
      }
    } catch (error) {
      showToast({
        type: "error",
        description: "Không thể tải danh sách sản phẩm",
        title: "Lỗi",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    const query = QueryBuilder.create().page(1).limit(100).build();

    const brandsData = await getBrands(query);
    if (brandsData.success) {
      const tmp: { id: string; name: string }[] = [];
      brandsData.data.data.forEach((brand: Brand) => {
        mapBrands.set(brand.id, brand.name);
        tmp.push({ id: brand.id, name: brand.name });
      });
      setBrands(tmp);
    } else {
      showToast({
        type: "error",
        description: "Lỗi tải danh sách thương hiệu",
        title: "Lỗi",
      });
    }
  };

  useEffect(() => {
    setSearchText(search);
  }, [search]);

  useEffect(() => {
    setSearchParams({ search: searchText });
  }, [searchText]);

  useEffect(() => {
    if (category) {
      setSearchParams({ category });
    }
    fetchProducts(1);
  }, [category]);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchProducts(1);
  }, [
    searchText,
    priceMin,
    priceMax,
    brandId,
    productTypeId,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchProducts(pagination.page);
  }, [pagination.page]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        {category === "accessory" ? (
          <Package className="h-8 w-8 text-primary" />
        ) : (
          <Phone className="h-8 w-8 text-primary" />
        )}
        <h1 className="text-3xl font-bold text-primary">
          {category === "accessory" ? "Phụ kiện" : "Điện thoại"}
        </h1>
      </div>
      <ProductFilter
        brandId={brandId}
        searchText={searchText}
        priceMax={priceMax}
        priceMin={priceMin}
        setPriceMax={setPriceMax}
        setPriceMin={setPriceMin}
        setSearchText={setSearchText}
        brands={brands}
        setBrandId={setBrandId}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        mapBrands={mapBrands}
        handleDefaultFilter={handleDefaultFilter}
      />

      <AnimatePresence mode="wait">
        {loading ? (
          <ProductLoading />
        ) : products.length === 0 ? (
          <ProductEmpty handleDefaultFilter={handleDefaultFilter} />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {products.map((p) => (
              <Product key={p.id} product={p} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {products.length > 0 && (
        <div className="mt-10">
          <ProductPagination
            pagination={pagination}
            setPagination={setPagination}
          />
        </div>
      )}
    </div>
  );
}
