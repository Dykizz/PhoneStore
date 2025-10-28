import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/cartContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  detailProductData,
  productData,
  brands,
  type DetailProduct,
  type BaseProduct,
} from "@/data";

const handleAddToCart = (e: React.MouseEvent, productId: string, quantity: number, name: string, price: number, image: string) => {
  e.stopPropagation();
  e.preventDefault();
  // Sử dụng addToCart từ CartContext
  addToCart({ id: productId, quantity, name, price, image });
};


// Hàm định dạng giá
function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "₫";
}

// Hàm tính giá sau khi áp dụng giảm giá
function calculateDiscountedPrice(price: number, discount: number): number {
  return price - (price * discount / 100);
}

export function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<DetailProduct | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<BaseProduct[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    // Tìm sản phẩm hiện tại
    const foundProduct = detailProductData.find((p) => p.id === id);
    setProduct(foundProduct || null);

    // Lấy ảnh đầu tiên để hiển thị
    if (foundProduct?.images) {
      setSelectedImage(foundProduct.images[0]);
    } else {
      setSelectedImage("");
    }

    // Lọc sản phẩm liên quan theo cùng thương hiệu
    if (foundProduct) {
      const currentBrand = brands.find(
        (b) => b.name === foundProduct.brandName
      );
      if (currentBrand) {
        const related = productData.filter(
          (p) =>
            p.brandId === String(currentBrand.brandId) &&
            p.id !== foundProduct.id // Loại trừ sản phẩm hiện tại
        );
        setRelatedProducts(related);
      }
    }

    setQuantity(1); // Reset số lượng
    setLoading(false); // Hoàn thành tải dữ liệu
  }, [id]);

  if (loading) {
    return (
      <div className="container py-8">
        <h1>Đang tải...</h1>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold">Sản phẩm không tồn tại</h1>
      </div>
    );
  }

  // Tăng/giảm số lượng sản phẩm
  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };
  const handleSelectColor = (index: number) => {
    if (product.images && product.images[index]) {
      setSelectedImage(product.images[index]);
    }
  };

  return (
    <>
      {/* CHI TIẾT SẢN PHẨM */}
      <div className="container py-10 flex flex-col lg:flex-row gap-10">
        {/* Hình ảnh sản phẩm */}
        <div className="flex flex-col lg:flex-row gap-6 w-full lg:w-2/3">
          {/* Thumbnails nhỏ */}
          <div className="flex lg:flex-col gap-3 order-2 lg:order-1">
            {product.images?.map((img, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectColor(idx)}
                className={`border rounded-lg overflow-hidden w-20 h-20 ${
                  selectedImage === img
                    ? "border-red-500"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <img
                  src={img}
                  alt={`thumb-${idx}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Ảnh lớn */}
          <div className="flex-1 flex justify-center items-center border rounded-xl order-1 lg:order-2 bg-white shadow-sm">
            <img
              src={selectedImage}
              alt={product.name}
              className="max-h-[500px] object-contain rounded-lg"
            />
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="flex-1 space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-gray-800">{product.detailDescription}</p>

          {/* Giá sản phẩm */}
          <div>
            {product.discountPercent && product.discountPercent > 0 ? (
              <>
                <div className="text-3xl font-bold text-red-600">
                  {/* Giá sau khi giảm */}
                  {formatPrice(
                    calculateDiscountedPrice(product.price, product.discountPercent)
                  )}
                </div>
                <div className="text-xl text-gray-500 line-through">
                  {/* Giá gốc bị gạch ngang */}
                  {formatPrice(product.price)}
                </div>
              </>
            ) : (
              <div className="text-3xl font-bold text-red-600">
                {/* Giá sản phẩm không giảm */}
                {formatPrice(product.price)}
              </div>
            )}
          </div>

          {/* Chọn màu */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Chọn màu:</h3>
              <div className="flex gap-3 flex-wrap">
                {product.colors.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectColor(idx)}
                    className={`px-4 py-2 border rounded-lg ${
                      selectedImage === product.images?.[idx]
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Số lượng */}
          <div className="flex items-center gap-4">
            <h3 className="font-semibold">Số lượng:</h3>
            <button
              onClick={decreaseQuantity}
              className="px-4 py-2 border rounded-lg hover:border-gray-300"
            >
              -
            </button>
            <span className="text-xl">{quantity}</span>
            <button
              onClick={increaseQuantity}
              className="px-4 py-2 border rounded-lg hover:border-gray-300"
            >
              +
            </button>
          </div>

          {/* Nút hành động */}
          <div className="flex gap-4 mt-8">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 border-2 border-gray-300"
              onClick={(e) => handleAddToCart(e, product.id, quantity, product.name, product.price, selectedImage)}
            >
              🛒 Thêm vào giỏ hàng
            </Button>

            <Button
              size="lg"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => alert("Chuyển đến trang thanh toán")}
            >
              Mua ngay
            </Button>
          </div>
        </div>
      </div>

      {/* Sản phẩm liên quan */}
      <section className="container py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Sản phẩm liên quan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedProducts.map((relatedProd) => (
            <Card key={relatedProd.id} className="h-full flex flex-col">
              <Link to={`/product/${relatedProd.id}`}>
                <CardHeader>
                  <CardTitle>{relatedProd.name}</CardTitle>
                  <CardDescription>{relatedProd.baseDescription}</CardDescription>
                </CardHeader>
              </Link>

              <CardContent className="flex flex-col flex-grow">
                <Link to={`/product/${relatedProd.id}`} className="block relative">
                  {relatedProd.discountPercent && relatedProd.discountPercent > 0 && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                      -{relatedProd.discountPercent}%
                    </div>
                  )}

                  <div className="aspect-square bg-muted rounded-lg mb-4">
                    <img
                      src={relatedProd.image}
                      alt={relatedProd.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </Link>

                <div className="mt-auto">
                  {relatedProd.discountPercent && relatedProd.discountPercent > 0 ? (
                    <div>
                      <p className="text-2xl font-bold text-red-600">
                        {formatPrice(
                          calculateDiscountedPrice(relatedProd.price, relatedProd.discountPercent)
                        )}
                      </p>
                      <p className="text-sm text-gray-500 line-through">
                        {formatPrice(relatedProd.price)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold">
                      {formatPrice(relatedProd.price)}
                    </p>
                  )}

                  <Button
                    className="w-full mt-4"
                    onClick={(e) => handleAddToCart(e, relatedProd.id, 1, relatedProd.name, relatedProd.price, relatedProd.image)}
                  >
                    Thêm sản phẩm
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
