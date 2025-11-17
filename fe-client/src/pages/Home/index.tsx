import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import type { BaseProduct } from "@/types/product.type";
import { getProducts } from "@/apis/product.api";
import { QueryBuilder } from "@/utils/queryBuilder";
import { showToast } from "@/utils/toast";
import Product from "../Products/Product";
import { Link } from "react-router-dom";

export function Home() {
  const [products, setProducts] = useState<BaseProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const query = QueryBuilder.create().page(1).limit(8).build();
        const response = await getProducts(query);
        if (!response.success) {
          throw new Error(response.message);
        }
        setProducts(response.data.data);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
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
          Chào mừng bạn đến với Phone Store
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Khám phá bộ sưu tập điện thoại di động mới nhất với giá cả phải chăng
          và chất lượng hàng đầu. Mua sắm ngay hôm nay để trải nghiệm sự khác
          biệt!
        </p>
        <div className="mt-10">
          <Link to="/products?category=phone">
            <Button size="lg" className="mr-4">
              Mua điện thoại
            </Button>
          </Link>

          <Link to="/products?category=accessory">
            <Button variant="outline" size="lg">
              Mua phụ kiện
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          Sản phẩm nổi bật
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <Product product={product} key={product.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
