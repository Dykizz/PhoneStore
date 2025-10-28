import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { productData, type BaseProduct } from "@/data";
import { useCart } from "@/contexts/cartContexts";

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "₫";
}
function calculateDiscountedPrice(price: number, discount: number): number {
  return price - (price * discount) / 100;
}

export function Home() {
  const [products, setProducts] = useState<BaseProduct[]>([]);
  const { addToCart } = useCart();

  const handleAddToCart = (
    e: React.MouseEvent,
    product: BaseProduct,
    quantity: number
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const finalPrice =
      product.discountPercent && product.discountPercent > 0
        ? calculateDiscountedPrice(product.price, product.discountPercent)
        : product.price;

    addToCart({
      id: product.id,
      quantity,
      name: product.name,
      price: finalPrice, 
      image: product.image,
    });
    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProducts(productData);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      }
    };

    loadProducts();
  }, []); 
  return (
    <div className="container py-8">
      {/* Phần giới thiệu */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
          Welcome to Phone Store
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Discover the latest smartphones, accessories, and tech gadgets at
          unbeatable prices.
        </p>
        <div className="mt-10">
          <Button size="lg" className="mr-4">
            Mua ngay
          </Button>
          <Button variant="outline" size="lg">
            Xem thêm
          </Button>
        </div>
      </section>

      {/* Phần sản phẩm nổi bật */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          Sản phẩm nổi bật
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lặp qua danh sách sản phẩm */}
          {products.map((product) => {
            // Tính giá hiển thị (để render ra giao diện)
            const displayPrice =
              product.discountPercent && product.discountPercent > 0
                ? calculateDiscountedPrice(product.price, product.discountPercent)
                : product.price;

            return (
              // Mỗi sản phẩm là một Card
              <Card key={product.id} className="h-full flex flex-col">
                {/* Phần Header Card (Tên, mô tả ngắn) */}
                <Link to={`/product/${product.id}`}>
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>{product.baseDescription}</CardDescription>
                  </CardHeader>
                </Link>

                {/* Phần Content Card (Ảnh, Giá, Nút) */}
                <CardContent className="flex flex-col flex-grow">
                  {/* Link bao quanh ảnh */}
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="aspect-square bg-muted rounded-lg mb-4 relative">
                      {/* Ảnh sản phẩm */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {/* Tag giảm giá (nếu có) */}
                      {product.discountPercent && product.discountPercent > 0 && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                          -{product.discountPercent}%
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Phần dưới cùng của Card (Giá và Nút) */}
                  <div className="mt-auto">
                    {/* Hiển thị giá */}
                    {product.discountPercent && product.discountPercent > 0 ? (
                      // Trường hợp có giảm giá
                      <>
                        <div className="text-3xl font-bold text-red-600">
                          {formatPrice(displayPrice)}
                        </div>
                        <div className="text-xl text-gray-500 line-through">
                          {formatPrice(product.price)} {/* Giá gốc */}
                        </div>
                      </>
                    ) : (
                      // Trường hợp không giảm giá
                      <div className="text-3xl font-bold text-red-600">
                        {formatPrice(product.price)}
                      </div>
                    )}
                    {/* Nút Thêm sản phẩm */}
                    <Button
                      className="w-full mt-4"
                      onClick={(e) => handleAddToCart(e, product, 1)} // Gọi hàm xử lý
                    >
                      Thêm sản phẩm
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}