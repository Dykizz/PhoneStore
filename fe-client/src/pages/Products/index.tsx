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

const PHONE_PRODUCT_TYPE_ID = "ebd5e145-d7eb-4cd0-80bc-e71e0a623c76";
const ACCESSORY_PRODUCT_TYPE_ID = "95ea2006-b528-4d15-81b6-2a4ac723fa09";

const defautFilter = {
  priceMin: undefined,
  priceMax: undefined,
  brandId: undefined,
  productTypeId: PHONE_PRODUCT_TYPE_ID,
  sortBy: "",
  sortOrder: "DESC" as "ASC" | "DESC",
  searchText: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<BaseProduct[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") ?? defautFilter.searchText;
  const initialCategory = searchParams.get("category") ?? "phone";
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLimit = Number(searchParams.get("limit")) || 8;
  const initialPriceMin = searchParams.get("priceMin")
    ? Number(searchParams.get("priceMin"))
    : undefined;
  const initialPriceMax = searchParams.get("priceMax")
    ? Number(searchParams.get("priceMax"))
    : undefined;
  const initialBrandId = searchParams.get("brandId") ?? undefined;
  const initialProductTypeId =
    searchParams.get("productTypeId") ??
    (initialCategory === "accessory"
      ? ACCESSORY_PRODUCT_TYPE_ID
      : PHONE_PRODUCT_TYPE_ID);
  const initialSortBy = searchParams.get("sortBy") ?? defautFilter.sortBy;
  const initialSortOrder =
    (searchParams.get("sortOrder") as "ASC" | "DESC") || defautFilter.sortOrder;

  const [pagination, setPagination] = useState<MetaPagination>({
    total: 0,
    page: initialPage,
    limit: initialLimit,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // make category reactive
  const [category, setCategory] = useState<string>(initialCategory);

  const [searchText, setSearchText] = useState<string>(initialSearch);
  const [priceMin, setPriceMin] = useState<number | undefined>(initialPriceMin);
  const [priceMax, setPriceMax] = useState<number | undefined>(initialPriceMax);
  const [brandId, setBrandId] = useState<string | undefined>(initialBrandId);
  const [productTypeId, setProductTypeId] = useState<string | undefined>(
    initialProductTypeId
  );

  const [sortBy, setSortBy] = useState<string>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">(initialSortOrder);

  const handleDefaultFilter = () => {
    setSearchText(defautFilter.searchText);
    setPriceMin(defautFilter.priceMin);
    setPriceMax(defautFilter.priceMax);
    setBrandId(defautFilter.brandId);
    setProductTypeId(defautFilter.productTypeId);
    setSortBy(defautFilter.sortBy);
    setSortOrder(defautFilter.sortOrder);

    setSearchParams(
      {
        page: "1",
        limit: String(pagination.limit),
        category,
      },
      { replace: true }
    );
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
        .filterIf(priceMin !== undefined, "price", { gte: priceMin })
        .filterIf(priceMax !== undefined, "price", { lte: priceMax })
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
    const params: Record<string, string> = {};
    if (searchText) params.search = searchText;
    if (category) params.category = category;
    if (priceMin !== undefined) params.priceMin = String(priceMin);
    if (priceMax !== undefined) params.priceMax = String(priceMax);
    if (brandId) params.brandId = brandId;
    if (productTypeId) params.productTypeId = productTypeId!;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    params.page = String(pagination.page);
    params.limit = String(pagination.limit);

    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchText,
    category,
    priceMin,
    priceMax,
    brandId,
    productTypeId,
    sortBy,
    sortOrder,
    pagination.page,
    pagination.limit,
  ]);

  useEffect(() => {
    const c = searchParams.get("category") ?? "phone";
    if (c !== category) {
      setCategory(c);
    }

    const ptFromUrl = searchParams.get("productTypeId");
    if (ptFromUrl) {
      if (ptFromUrl !== productTypeId) setProductTypeId(ptFromUrl);
    } else {
      const defaultPt =
        c === "accessory" ? ACCESSORY_PRODUCT_TYPE_ID : PHONE_PRODUCT_TYPE_ID;
      if (defaultPt !== productTypeId) setProductTypeId(defaultPt);
    }

    const pageFromUrl = Number(searchParams.get("page")) || 1;
    if (pageFromUrl !== pagination.page) {
      setPagination((p) => ({ ...p, page: pageFromUrl }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    fetchBrands();
    fetchProducts(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination((p) => ({ ...p, page: 1 }));
    } else {
      fetchProducts(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
