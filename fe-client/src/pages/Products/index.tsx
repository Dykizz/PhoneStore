"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 🧩 Định nghĩa interface gốc
export interface BaseProduct {
  id: string;
  name: string;
  price: number;
  isReleased: boolean;
  image?: string;
  discount?: {
    discountPercent: number;
    startDate: Date;
    endDate: Date;
  };
  quantitySold: number;
  quantity: number;
  productTypeId: string;
  brandId: string;
}

// 🧩 Dữ liệu demo (đúng cấu trúc BaseProduct)
const products: BaseProduct[] = [
  {
    id: "1",
    name: "Điện thoại iPhone 16 Pro Max 256GB",
    image: "/iphone-16-pro-max.webp",
    price: 30590000,
    isReleased: true,
    discount: {
      discountPercent: 13,
      startDate: new Date("2025-10-01"),
      endDate: new Date("2025-12-31"),
    },
    quantitySold: 500,
    quantity: 200,
    productTypeId: "smartphone",
    brandId: "apple",
  },
  {
    id: "2",
    name: "Samsung Galaxy S25 Ultra 12GB 256GB",
    image: "/dien-thoai-samsung-galaxy-s25-ultra_3__3.webp",
    price: 28280000,
    isReleased: true,
    discount: {
      discountPercent: 15,
      startDate: new Date("2025-09-01"),
      endDate: new Date("2025-12-31"),
    },
    quantitySold: 450,
    quantity: 300,
    productTypeId: "smartphone",
    brandId: "samsung",
  },
  {
    id: "3",
    name: "iPhone Air 256GB | Chính hãng",
    image: "/iphone_air-3_2.webp",
    price: 31390000,
    isReleased: true,
    quantitySold: 100,
    quantity: 150,
    productTypeId: "smartphone",
    brandId: "apple",
  },
  {
    id: "4",
    name: "iPhone 15 128GB | Chính hãng VN/A",
    image: "/iphone-15-plus_1__1.webp",
    price: 17390000,
    isReleased: true,
    discount: {
      discountPercent: 13,
      startDate: new Date("2025-10-01"),
      endDate: new Date("2025-12-31"),
    },
    quantitySold: 700,
    quantity: 250,
    productTypeId: "smartphone",
    brandId: "apple",
  },
];

export default function ProductPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-3 mb-6">
        {["Bộ lọc", "Sẵn hàng", "Hàng mới về", "Xem theo giá", "Nhu cầu sử dụng"].map(
          (item) => (
            <Button key={item} variant="outline" className="rounded-full">
              {item}
            </Button>
          )
        )}
      </div>

      {/* Danh mục con */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          "Bộ nhớ trong",
          "Tính năng đặc biệt",
          "Chip xử lí",
          "Dung lượng RAM",
          "Công nghệ NFC",
        ].map((item) => (
          <Button key={item} variant="secondary" className="rounded-full text-sm">
            {item} ▼
          </Button>
        ))}
      </div>

      {/* Thanh sắp xếp */}
      <div className="flex gap-3 mb-6">
        {["Phổ biến", "Khuyến mãi HOT", "Giá Thấp - Cao", "Giá Cao - Thấp"].map(
          (sort) => (
            <Button key={sort} variant="outline" className="rounded-full">
              {sort}
            </Button>
          )
        )}
      </div>

      {/* Lưới sản phẩm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => {
          const now = new Date();
          const hasDiscount =
            p.discount &&
            now >= new Date(p.discount.startDate) &&
            now <= new Date(p.discount.endDate);

          const finalPrice = hasDiscount
            ? Math.round(p.price * (1 - p.discount!.discountPercent / 100))
            : p.price;

          return (
            <Card
              key={p.id}
              className="overflow-hidden hover:shadow-lg transition relative"
            >
              {/* Header */}
              <CardHeader className="p-0 relative">
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="object-contain w-full h-full p-4 rounded-md shadow-sm transition-transform duration-300 hover:scale-105"
                  />
                )}
                {hasDiscount && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    -{p.discount!.discountPercent}%
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
