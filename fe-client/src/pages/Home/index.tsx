"use client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { getProducts } from "@/apis/product.api";
import { QueryBuilder } from "@/utils/queryBuilder";
import { showToast } from "@/utils/toast";
import type { BaseProduct } from "@/types/product.type";
import { useCart } from "@/contexts/cartContexts";

function formatPrice(price: number) {
  return Number(price).toLocaleString("vi-VN") + "₫";
}

function calculateDiscountedPrice(price: number, discount: number): number {
  return price - (price * discount) / 100;
}

export function Home() {
  const [products, setProducts] = useState<BaseProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  const handleAddToCart = (
    e: React.MouseEvent,
    productToAdd: BaseProduct,
    qty: number,
    selectedIndex: number
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const selectedVariant = productToAdd.variants[selectedIndex];
    if (!selectedVariant) return;

    const finalPrice = productToAdd.discount
      ? calculateDiscountedPrice(
          Number(productToAdd.price),
          productToAdd.discount.discountPercent
        )
      : Number(productToAdd.price);

    addToCart(
      {
        productId: productToAdd.id,
        quantity: qty,
        name: productToAdd.name,
        price: finalPrice,
        image: selectedVariant.image,
        variantInfo: `Phiên bản: ${selectedVariant.color}`,
      },
      selectedVariant.id || "default"
    );

    showToast({
      title: "Đã thêm vào giỏ hàng 🛒",
      description: `${productToAdd.name} (${selectedVariant.color}) đã được thêm.`,
    });
  };

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const query = QueryBuilder.create().page(1).limit(4).build();
        const response = await getProducts(query);

        if (!response.success) throw new Error(response.message);
        setProducts(response.data.data);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        setError(error instanceof Error ? error.message : "Lỗi không xác định");
        showToast({
          title: "Lỗi",
          description: "Không thể tải sản phẩm, vui lòng thử lại sau.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96 text-gray-600 text-lg">
        Đang tải sản phẩm...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-96 text-red-500 text-lg">
        {error}
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ==== HERO SECTION ==== */}
      <section className="text-center py-16">
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold tracking-tight lg:text-6xl text-gray-900"
        >
          Welcome to <span className="text-black">Phone Store</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-gray-600"
        >
          Khám phá những mẫu điện thoại và phụ kiện công nghệ mới nhất với mức giá tốt nhất.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-10 flex justify-center gap-4"
        >
          <Button size="lg" className="rounded-full font-medium shadow-md">
            Mua ngay
          </Button>
          <Button variant="outline" size="lg" className="rounded-full font-medium">
            Xem thêm
          </Button>
        </motion.div>
      </section>

      {/* ==== SẢN PHẨM NỔI BẬT ==== */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
          Sản phẩm nổi bật
        </h2>

        <AnimatePresence mode="wait">
          <motion.div
            key="featured-products"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {products.map((product) => {
              const firstVariant = product.variants?.[0];
              if (!firstVariant) return null;

              const hasDiscount = !!product.discount;
              const discountPercent = product.discount?.discountPercent ?? 0;
              const finalPrice = hasDiscount
                ? calculateDiscountedPrice(Number(product.price), discountPercent)
                : Number(product.price);

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className="overflow-hidden border border-gray-200 bg-white 
                    rounded-2xl shadow-sm hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] 
                    transition-all duration-300 relative group hover:-translate-y-1"
                  >
                    <Link to={`/products/${product.id}`}>
                      {/* ẢNH */}
                      <CardHeader className="p-0 relative flex items-center justify-center bg-white h-64 cursor-pointer">
                        <div className="overflow-hidden w-full h-full flex items-center justify-center bg-white rounded-xl">
                          <img
                            src={firstVariant.image}
                            alt={product.name}
                            className="object-contain w-full h-full p-4 transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>

                        {hasDiscount && (
                          <span className="absolute top-2 left-2 bg-black text-white text-[11px] px-2 py-1 rounded-md shadow-sm">
                            -{discountPercent}%
                          </span>
                        )}
                        {!product.isReleased && (
                          <span className="absolute top-2 right-2 bg-gray-800 text-white text-[11px] px-2 py-1 rounded-md">
                            Sắp ra mắt
                          </span>
                        )}
                      </CardHeader>

                      {/* NỘI DUNG */}
                      <CardContent className="p-4 text-center">
                        <CardTitle className="text-base font-semibold mb-2 line-clamp-2 text-gray-900 hover:text-black transition-colors">
                          {product.name}
                        </CardTitle>

                        <div className="flex flex-col items-center">
                          <span className="text-black font-bold text-xl">
                            {formatPrice(finalPrice)}
                          </span>
                          {hasDiscount && (
                            <span className="text-gray-400 text-sm line-through">
                              {formatPrice(Number(product.price))}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Link>

                    {/* NÚT */}
                    <CardFooter className="px-4 pb-4">
                      <Button
                        className="w-full text-sm py-2.5 font-medium text-white bg-black 
                        hover:bg-gray-900 transition-all duration-300 rounded-full 
                        shadow-md hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                        onClick={(e) => handleAddToCart(e, product, 1, 0)}
                      >
                        Thêm vào giỏ hàng
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
