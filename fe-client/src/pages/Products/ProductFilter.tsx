import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
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
  priceMin: number | undefined;
  setPriceMin: (priceMin: number) => void;
  priceMax: number | undefined;
  setPriceMax: (priceMax: number) => void;
  mapBrands: Map<string, string>;
  brands: { id: string; name: string }[];
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
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  mapBrands,
  brands,
  handleDefaultFilter,
}: ProductFilterProps) {
  return (
    <div className="bg-card border rounded-2xl shadow-sm p-4 mb-10 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-5 h-5 text-foreground" />
        <h2 className="font-semibold text-foreground text-lg">
          Bộ lọc sản phẩm
        </h2>
      </div>
      <Button
        onClick={handleDefaultFilter}
        variant="outline"
        className="text-sm font-medium rounded-full transition-all"
      >
        Đặt lại
      </Button>

      <Input
        placeholder="Tìm kiếm sản phẩm..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="rounded-full"
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
          <SelectTrigger className="w-[180px] rounded-full text-sm flex items-center justify-between">
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
          <SelectTrigger className="w-[180px] rounded-full text-sm flex items-center justify-between">
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
      </div>

      <div className="w-[300px] flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">
          Khoảng giá
        </label>
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
              className="text-sm rounded-full"
            />
          </div>

          <span className="text-muted-foreground">-</span>
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Giá đến"
              value={priceMax}
              step={100000}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              min={priceMin}
              className="text-sm rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
