import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { productData, type BaseProduct } from "@/data";
import { useCart } from "@/contexts/cartContexts";

function formatPrice(price: number) {
  return price.toLocaleString('vi-VN') + '₫';
}

function calculateDiscountedPrice(price: number, discount: number): number {
  return price - (price * discount / 100);
}

export function Home() {
  const [products, setProducts] = useState<BaseProduct[]>([]);
   const { addToCart } = useCart();  // Lấy hàm addToCart từ CartContext

  const handleAddToCart = (e: React.MouseEvent, productId: string, quantity: number, name: string, price: number, image: string) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart({ id: productId, quantity, name, price, image });
  };

  //Dùng useEffect để gọi API khi component render
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

      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          Sản phẩm nổi bật
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="h-full flex flex-col">
              <Link to={`/product/${product.id}`}>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.baseDescription}</CardDescription> 
                </CardHeader>
              </Link>

              <CardContent className="flex flex-col flex-grow">
                <Link to={`/product/${product.id}`} className="block">
                  <div className="aspect-square bg-muted rounded-lg mb-4 relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    
                    {/* Hiển thị tag giảm giá nếu có */}
                    {product.discountPercent && product.discountPercent > 0 && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                        -{product.discountPercent}%
                      </div>
                    )}
                  </div>
                </Link>

                <div className="mt-auto">
                  {product.discountPercent && product.discountPercent > 0 ? (
                    <>
                      <div className="text-3xl font-bold text-red-600">
                        {formatPrice(
                          calculateDiscountedPrice(product.price, product.discountPercent)
                        )}
                      </div>
                      <div className="text-xl text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </div>
                    </>
                  ) : (
                    <div className="text-3xl font-bold text-red-600">
                      {formatPrice(product.price)}
                    </div>
                  )}
                  <Button
                    className="w-full mt-4"
                    onClick={(e) => handleAddToCart(e, product.id, 1, product.name, product.price, product.image)}
                  >
                    Thêm sản phẩm
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
