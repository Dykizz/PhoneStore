import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import type { ProductType } from "@/types/productType.type";
import type { Brand } from "@/types/brand.type";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface ProductFilterProps {
  searchText: string;
  setSearchText: (text: string) => void;
  sortBy: string | undefined;
  setSortBy: (sortBy: string) => void;
  sortOrder: "ASC" | "DESC" | undefined;
  setSortOrder: (sortOrder: "ASC" | "DESC") => void;
  brandId: string | undefined;
  setBrandId: (brandId: string | undefined) => void;
  productTypeId: string | undefined;
  setProductTypeId: (productTypeId: string | undefined) => void;
  priceMin: number | undefined;
  setPriceMin: (priceMin: number) => void;
  priceMax: number | undefined;
  setPriceMax: (priceMax: number) => void;
  mapBrands: Map<string, string>;
  mapProductTypes: Map<string, string>;
  brands: { id: string; name: string }[];
  productTypes: { id: string; name: string }[];
  handleDefaultFilter: () => void;
}

export default function ProductFilter({
  searchText,
  setSearchText,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  brandId,
  setBrandId,
  productTypeId,
  setProductTypeId,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  mapBrands,
  mapProductTypes,
  brands,
  productTypes,
  handleDefaultFilter,
}: ProductFilterProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 mb-10 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-5 h-5 text-black" />
        <h2 className="font-semibold text-gray-900 text-lg">Bộ lọc sản phẩm</h2>
      </div>
      <Button
        onClick={handleDefaultFilter}
        variant="outline"
        className="text-sm font-medium rounded-full border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-black transition-all"
      >
        Đặt lại
      </Button>

      <Input
        placeholder="Tìm kiếm sản phẩm..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <div className="w-full flex flex-wrap items-center gap-3 mt-2">
        <Select
          value={sortBy && `${sortBy}-${sortOrder}`}
          onValueChange={(value) => {
            const [field, order] = value.split("-");
            setSortBy(field);
            setSortOrder(order as "ASC" | "DESC");
          }}
        >
          <SelectTrigger className="w-[180px] rounded-full text-sm border-gray-300 flex items-center justify-between hover:bg-gray-100 text-gray-800">
            {sortBy
              ? `Giá ${sortOrder === "ASC" ? "tăng dần" : "giảm dần"}`
              : "Sắp xếp theo giá"}
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="cursor-pointer" value="-DESC">
              Mặc định
            </SelectItem>
            <SelectItem className="cursor-pointer" value="price-ASC">
              Giá tăng dần
            </SelectItem>
            <SelectItem className="cursor-pointer" value="price-DESC">
              Giá giảm dần
            </SelectItem>
            <SelectItem className="cursor-pointer" value="createdAt-DESC">
              Mới nhất
            </SelectItem>
            <SelectItem className="cursor-pointer" value="createdAt-ASC">
              Cũ nhất
            </SelectItem>
            <SelectItem className="cursor-pointer" value="quantitySold-DESC">
              Bán chạy nhất
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          key={brandId}
          value={brandId || "all"}
          onValueChange={(value) => {
            setBrandId(value === "all" ? undefined : value);
          }}
        >
          <SelectTrigger className="w-[180px] rounded-full text-sm border-gray-300 flex items-center justify-between hover:bg-gray-100 text-gray-800">
            {brandId ? mapBrands.get(brandId) : "Thương hiệu"}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {brands.map((brand) => (
              <SelectItem
                className="cursor-pointer"
                key={brand.id}
                value={brand.id}
              >
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          key={productTypeId}
          value={productTypeId || "all"}
          onValueChange={(value) =>
            setProductTypeId(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-[180px] rounded-full text-sm border-gray-300 flex items-center justify-between hover:bg-gray-100 text-gray-800">
            {productTypeId
              ? mapProductTypes.get(productTypeId)
              : "Loại sản phẩm"}
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="cursor-pointer" value="all">
              Tất cả
            </SelectItem>
            {productTypes.map((type) => (
              <SelectItem
                className="cursor-pointer"
                key={type.id}
                value={type.id}
              >
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[300px] flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Khoảng giá</label>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Giá từ"
              value={priceMin}
              step={100000}
              onChange={(e) => setPriceMin(Number(e.target.value) || 0)}
              defaultValue={0}
              min={0}
              max={priceMax}
              className="text-sm"
            />
          </div>
          <span className="text-gray-500">-</span>
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Giá đến"
              value={priceMax}
              step={100000}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              min={priceMin}
              className="text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
