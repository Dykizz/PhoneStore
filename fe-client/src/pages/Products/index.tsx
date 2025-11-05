"use client";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export default function ProductsPage() {
  const products: BaseProduct[] = productData;

  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ==== THANH BỘ LỌC ==== */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 mb-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-black" />
          <h2 className="font-semibold text-gray-900 text-lg">
            Bộ lọc sản phẩm
          </h2>
        </div>
        <Button
          variant="outline"
          className="text-sm font-medium rounded-full border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-black transition-all"
        >
          Đặt lại
        </Button>

        <div className="w-full flex flex-wrap items-center gap-3 mt-2">
          {["Sẵn hàng", "Hàng mới về"].map((item) => (
            <Button
              key={item}
              variant="secondary"
              className="rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-black transition-all"
            >
              {item}
            </Button>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full text-sm border-gray-300 flex items-center justify-between hover:bg-gray-100 text-gray-800"
              >
                Xem theo giá
                <ChevronDown className="w-4 h-4 ml-1" />
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
                className="rounded-full text-sm border-gray-300 flex items-center justify-between hover:bg-gray-100 text-gray-800"
              >
                Nhu cầu sử dụng
                <ChevronDown className="w-4 h-4 ml-1" />
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

      {/* ==== DANH SÁCH SẢN PHẨM ==== */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="grid grid-cols-4 gap-6"
        >
          {currentProducts.map((p) => {
            const hasDiscount = !!p.discountPercent;
            const finalPrice = hasDiscount
              ? Math.round(p.price * (1 - p.discountPercent! / 100))
              : p.price;

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="overflow-hidden border border-gray-200 bg-white hover:border-black rounded-2xl
                   shadow-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-300 relative group hover:-translate-y-1"
                >
                  {/* ẢNH SẢN PHẨM */}
                  <Link to={`/product/${p.id}`}>
                    <CardHeader className="p-0 relative flex items-center justify-center bg-white h-64 cursor-pointer">
                      <div className="overflow-hidden w-full h-full flex items-center justify-center bg-gray-50">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="object-contain w-full h-full p-4 transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      {hasDiscount && (
                        <span
                          className="absolute top-2 left-2 bg-black text-white 
                               text-[11px] px-2 py-1 rounded-md shadow-sm"
                        >
                          -{p.discountPercent}%
                        </span>
                      )}
                      {!p.isReleased && (
                        <span className="absolute top-2 right-2 bg-gray-800 text-white text-[11px] px-2 py-1 rounded-md">
                          Sắp ra mắt
                        </span>
                      )}
                    </CardHeader>
                  </Link>

                  {/* THÔNG TIN SẢN PHẨM */}
                  <CardContent className="p-4">
                    <Link to={`/product/${p.id}`}>
                      <CardTitle className="text-sm font-semibold mb-2 line-clamp-2 text-gray-900 group-hover:text-black transition-colors">
                        {p.name}
                      </CardTitle>
                    </Link>

                    <div className="flex flex-col">
                      <span className="text-black font-bold text-lg">
                        {finalPrice.toLocaleString()}₫
                      </span>
                      {hasDiscount && (
                        <span className="text-gray-400 text-sm line-through">
                          {p.price.toLocaleString()}₫
                        </span>
                      )}
                    </div>
                  </CardContent>

                  {/* NÚT XEM CHI TIẾT */}
                  <CardFooter className="px-4 pb-4">
                    <Link to={`/product/${p.id}`} className="w-full">
                      <Button
                        className="w-full text-sm py-2 font-medium text-white bg-black hover:bg-gray-900 
                         transition-all duration-300 rounded-full shadow-md hover:shadow-lg"
                      >
                        Xem chi tiết
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* ==== PHÂN TRANG ==== */}
      <div className="mt-10">
        <Pagination>
          <PaginationContent className="flex justify-center gap-1">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => handlePageChange(currentPage - 1)}
                className={`border border-gray-300 text-gray-700 hover:bg-gray-100 ${
                  currentPage === 1 ? "opacity-40 pointer-events-none" : ""
                }`}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={() => handlePageChange(page)}
                  className={`${
                    page === currentPage
                      ? "bg-black text-white hover:bg-gray-900"
                      : "hover:bg-gray-100 text-gray-800"
                  } border border-gray-300 rounded-md`}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            {totalPages > 5 && <PaginationEllipsis />}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => handlePageChange(currentPage + 1)}
                className={`border border-gray-300 text-gray-700 hover:bg-gray-100 ${
                  currentPage === totalPages
                    ? "opacity-40 pointer-events-none"
                    : ""
                }`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
