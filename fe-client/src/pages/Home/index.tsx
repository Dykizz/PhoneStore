import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  // CardDescription
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/cartContexts";
import type { BaseProduct } from "@/types/product.type";
import { getProducts } from "@/apis/product.api";
import { QueryBuilder } from "@/utils/queryBuilder";
import { showToast } from "@/utils/toast";

function formatPrice(price: number) {
  return price.toLocaleString("en-US") + "₫";
}

function calculateDiscountedPrice(price: number, discount: number): number {
  return price - (price * discount) / 100;
}

export function Home() {
  const [products, setProducts] = useState<BaseProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = (
    e: React.MouseEvent,
    productToAdd: BaseProduct,
    qty: number,
    selectedIndex: number
  ) => {
    e.stopPropagation();
    e.preventDefault();


  if (!isAuthenticated) {
      showToast({
        title: "Yêu cầu đăng nhập",
        description: "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.",
      });
      navigate("/login"); 
      return; 
    }

    const selectedVariant = productToAdd.variants[selectedIndex];
    if (!selectedVariant) return;

    const variantIdPart = selectedVariant.id || "default";
    const variantDisplayInfo = `Phiên bản: ${selectedVariant.color}`;
    const imageForCart = selectedVariant.image;

    const finalPrice = productToAdd.discount
      ? calculateDiscountedPrice(
          productToAdd.price,
          productToAdd.discount.discountPercent
        )
      : productToAdd.price;

    addToCart(
      {
        productId: productToAdd.id,
        quantity: qty,
        name: productToAdd.name,
        price: finalPrice,
        image: imageForCart,
        variantInfo: variantDisplayInfo,
      },
      variantIdPart
    );

    alert(
      `Đã thêm ${qty} ${productToAdd.name} (${variantDisplayInfo}) vào giỏ hàng!`
    );
  };

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      console.log("Bắt đầu tải sản phẩm...");
      console.log("tai sp");
      try {
        const query = QueryBuilder.create().page(1).limit(4).build();

        const response = await getProducts(query);
        if (!response.success) {
          throw new Error(response.message);
        }
        setProducts(response.data.data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Lỗi không xác định");
        showToast({
          title: "Lỗi",
          description: "Lỗi khi tải sản phẩm",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="container py-8 text-center">Đang tải sản phẩm...</div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 text-center text-red-600">
        Lỗi khi tải sản phẩm: {error}
      </div>
    );
  }
  
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

      {/* Phần sản phẩm nổi bật */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Sản phẩm nổi bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => {
            const firstVariant = product.variants && product.variants[0];
            if (!firstVariant) {
              return null;
            }

            const hasDiscount = !!product.discount;
            const finalPrice = hasDiscount
              ? calculateDiscountedPrice(
                  product.price,
                  product.discount.discountPercent
                )
              : product.price;

            return (
              <Link to={`/product/${product.id}`} key={product.id} className="h-full flex flex-col">
                <Card
                  className="overflow-hidden hover:shadow-lg transition relative h-full flex flex-col"
                >
                  <CardHeader className="p-0 relative flex items-center justify-center bg-white h-64">
                    <img
                      src={firstVariant.image}
                      alt={product.name}
                      className="object-contain w-full h-full p-4 rounded-md shadow-sm transition-transform duration-300 hover:scale-105"
                    />
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                        -{product.discount.discountPercent}%
                      </span>
                    )}
                    {!product.isReleased && (
                      <span className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                        Sắp ra mắt
                      </span>
                    )}
                  </CardHeader>

                  {/* Nội dung */}
                  <CardContent className="p-4 flex flex-col flex-grow">
                    <CardTitle className="text-sm font-semibold mb-2 line-clamp-2">
                      {product.name}
                    </CardTitle>
                    
                    <div className="text-red-600 font-bold text-lg">
                      {formatPrice(finalPrice)}
                    </div>
                    {hasDiscount && (
                      <div className="text-gray-400 text-sm line-through">
                        {formatPrice(product.price)}
                      </div>
                    )}
                    
                    <Button
                      className="w-full mt-4 mt-auto"
                      onClick={(e) => handleAddToCart(e, product, 1, 0)}
                    >
                      Thêm sản phẩm
                    </Button>

                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}