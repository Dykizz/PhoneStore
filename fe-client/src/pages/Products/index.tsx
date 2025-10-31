"use client";
import { productData, type BaseProduct } from "@/data";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

export default function ProductsPage() {
  const products: BaseProduct[] = productData;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="w-full bg-white border rounded-xl shadow-sm mb-6">
        {/* Tiêu đề */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-red-600" />
            Bộ lọc sản phẩm
          </h2>
          <Button
            variant="outline"
            className="text-sm font-medium rounded-full border-gray-300 hover:bg-red-50 hover:text-red-600"
          >
            Đặt lại
          </Button>
        </div>

        {/* Các nhóm bộ lọc */}
        <div className="flex flex-wrap items-center gap-3 p-4">
          {/* Bộ lọc nhanh */}
          <div className="flex flex-wrap gap-2">
            {["Sẵn hàng", "Hàng mới về"].map((item) => (
              <Button
                key={item}
                variant="secondary"
                className="rounded-full text-sm bg-gray-100 hover:bg-red-100 hover:text-red-600"
              >
                {item}
              </Button>
            ))}
          </div>

          {/* Dropdown thực tế */}
          <div className="flex flex-wrap gap-2 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full text-sm border-gray-300 flex items-center gap-1"
                >
                  Xem theo giá
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>Dưới 15 triệu</DropdownMenuItem>
                <DropdownMenuItem>15 - 25 triệu</DropdownMenuItem>
                <DropdownMenuItem>Trên 25 triệu</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full text-sm border-gray-300 flex items-center gap-1"
                >
                  Nhu cầu sử dụng
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>Chụp ảnh & quay video</DropdownMenuItem>
                <DropdownMenuItem>Chơi game & hiệu năng</DropdownMenuItem>
                <DropdownMenuItem>Pin lâu, dùng cơ bản</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Lưới sản phẩm */}
      <div className="grid grid-cols-4 gap-6">
        {products.map((p) => {
          const hasDiscount = !!p.discountPercent;
          const finalPrice = hasDiscount
            ? Math.round(p.price * (1 - p.discountPercent! / 100))
            : p.price;

          return (
            <Card
              key={p.id}
              className="overflow-hidden hover:shadow-lg transition relative"
            >
              {/* Header */}
              <CardHeader className="p-0 relative flex items-center justify-center bg-white h-64">
                <img
                  src={p.image}
                  alt={p.name}
                  className="object-contain w-full h-full p-4 rounded-md shadow-sm transition-transform duration-300 hover:scale-105"
                />
                {hasDiscount && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    -{p.discountPercent}%
                  </span>
                )}
                {!p.isReleased && (
                  <span className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                    Sắp ra mắt
                  </span>
                )}
              </CardHeader>

              {/* Nội dung */}
              <CardContent className="p-4">
                <CardTitle className="text-sm font-semibold mb-2 line-clamp-2">
                  {p.name}
                </CardTitle>
                <div className="text-red-600 font-bold text-lg">
                  {finalPrice.toLocaleString()}đ
                </div>
                {hasDiscount && (
                  <div className="text-gray-400 text-sm line-through">
                    {p.price.toLocaleString()}đ
                  </div>
                )}
              </CardContent>

              {/* Footer */}
              <CardFooter>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Xem chi tiết
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
