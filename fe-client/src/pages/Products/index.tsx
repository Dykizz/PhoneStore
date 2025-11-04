"use client";
import { useState } from "react";
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

  // -------------------------------
  // ⚙️ PHÂN TRANG
  const itemsPerPage = 8; // số sản phẩm mỗi trang
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" }); // cuộn lên đầu khi đổi trang
    }
  };
  // -------------------------------

  return (
    <div className="p-6 max-w-7xl mx-auto flex gap-8">
      {/* ==== CỘT TRÁI: BỘ LỌC ==== */}
      <div className="w-1/4 bg-white border rounded-xl shadow-sm h-fit ml-[-1rem]">
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

        <div className="p-4 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {["Sẵn hàng", "Hàng mới về"].map((item) => (
              <Button
                key={item}
                variant="secondary"
                className="rounded-full text-sm bg-gray-100 hover:bg-red-100 hover:text-red-600 w-full"
              >
                {item}
              </Button>
            ))}
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full text-sm border-gray-300 flex items-center justify-between w-full"
                >
                  Xem theo giá
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem>Dưới 15 triệu</DropdownMenuItem>
                <DropdownMenuItem>15 - 25 triệu</DropdownMenuItem>
                <DropdownMenuItem>Trên 25 triệu</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full text-sm border-gray-300 flex items-center justify-between w-full"
                >
                  Nhu cầu sử dụng
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem>Chụp ảnh & quay video</DropdownMenuItem>
                <DropdownMenuItem>Chơi game & hiệu năng</DropdownMenuItem>
                <DropdownMenuItem>Pin lâu, dùng cơ bản</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ==== CỘT PHẢI: DANH SÁCH SẢN PHẨM ==== */}
      <div className="w-3/4">
        <div className="grid grid-cols-4 gap-6">
          {currentProducts.map((p) => {
            const hasDiscount = !!p.discountPercent;
            const finalPrice = hasDiscount
              ? Math.round(p.price * (1 - p.discountPercent! / 100))
              : p.price;

            return (
              <Card
                key={p.id}
                className="overflow-hidden hover:shadow-lg transition relative"
              >
                {/* Hình ảnh */}
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

                {/* Nút */}
                <CardFooter>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Xem chi tiết
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* ==== PHÂN TRANG ==== */}
        <div className="flex justify-center items-center mt-10 gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            « Trước
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              className={`${
                page === currentPage
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "hover:bg-red-50"
              } rounded-full w-9 h-9`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sau »
          </Button>
        </div>
      </div>
    </div>
  );
}
