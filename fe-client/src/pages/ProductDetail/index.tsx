"use client";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cartContexts";
import {
  Card,
  CardContent,
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

// 👉 Format giá
function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "₫";
}

// 👉 Giá sau giảm
function calculateDiscountedPrice(price: number, discount: number): number {
  return price - (price * discount) / 100;
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<DetailProduct | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<BaseProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const found = detailProductData.find((p) => p.id.toString() === String(id));
    setProduct(found || null);

    if (found?.images?.length) {
      setSelectedImage(found.images[0]);
      setSelectedColorIndex(0);
    }

    if (found) {
      const brand = brands.find((b) => b.name === found.brandName);
      if (brand) {
        const related = productData.filter(
          (p) => p.brandId === String(brand.brandId) && p.id !== found.id
        );
        setRelatedProducts(related);
      }
    }

    setQuantity(1);
    setLoading(false);
  }, [id]);

  const handleSelectColor = (index: number) => {
    if (product?.images && product.images[index]) {
      setSelectedImage(product.images[index]);
      setSelectedColorIndex(index);
    }
  };

  const handleAddToCart = (productToAdd: DetailProduct, qty: number) => {
    const selectedColor =
      productToAdd.colors?.[selectedColorIndex] ?? "Mặc định";
    const image =
      productToAdd.images?.[selectedColorIndex] ?? productToAdd.images?.[0];

    const finalPrice =
      productToAdd.discountPercent && productToAdd.discountPercent > 0
        ? calculateDiscountedPrice(
            productToAdd.price,
            productToAdd.discountPercent
          )
        : productToAdd.price;

    addToCart(
      {
        productId: productToAdd.id,
        quantity: qty,
        name: productToAdd.name,
        price: finalPrice,
        image: image || "",
        variantInfo: `Màu: ${selectedColor}`,
      },
      `variant-${selectedColorIndex}`
    );

    alert(
      `Đã thêm ${qty} ${productToAdd.name} (${selectedColor}) vào giỏ hàng!`
    );
  };

  if (loading)
    return (
      <div className="text-center py-10 text-gray-500">
        Đang tải sản phẩm...
      </div>
    );

  if (!product)
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Sản phẩm không tồn tại
        </h1>
        <Link to="/">
          <Button variant="link" className="text-gray-600 underline">
            Quay lại trang chủ
          </Button>
        </Link>
      </div>
    );

  const displayPrice =
    product.discountPercent && product.discountPercent > 0
      ? calculateDiscountedPrice(product.price, product.discountPercent)
      : product.price;

  return (
    <div className="container py-10">
      {/* ==== ẢNH & THÔNG TIN ==== */}
      <div className="flex flex-col lg:flex-row gap-10 bg-white rounded-2xl shadow-md p-6 border border-gray-200">
        {/* Ảnh */}
        <div className="flex flex-col lg:flex-row gap-6 w-full lg:w-2/3">
          <div className="flex lg:flex-col gap-3 order-2 lg:order-1">
            {product.images?.map((img, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectColor(idx)}
                className={`border rounded-xl overflow-hidden w-20 h-20 transition-all duration-300 ${
                  selectedColorIndex === idx
                    ? "border-black ring-2 ring-gray-300 scale-105"
                    : "border-gray-300 hover:border-black"
                }`}
              >
                <img
                  src={img}
                  alt={`Màu ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          <div className="flex-1 flex justify-center items-center border rounded-2xl bg-gray-50 shadow-inner order-1 lg:order-2">
            <img
              src={selectedImage}
              alt={product.name}
              className="max-h-[480px] object-contain p-4 transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>

        {/* Thông tin */}
        <div className="flex-1 space-y-5">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-600">{product.detailDescription}</p>

          {/* Giá */}
          <div>
            {product.discountPercent ? (
              <>
                <div className="text-4xl font-bold text-gray-900">
                  {formatPrice(displayPrice)}
                </div>
                <div className="text-lg text-gray-400 line-through">
                  {formatPrice(product.price)}
                </div>
              </>
            ) : (
              <div className="text-4xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </div>
            )}
          </div>

          {/* Màu */}
          {product.colors && (
            <div>
              <h3 className="font-semibold mb-2 text-gray-800">Chọn màu:</h3>
              <div className="flex gap-3 flex-wrap">
                {product.colors.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectColor(idx)}
                    className={`px-4 py-2 border rounded-full text-sm transition-all ${
                      selectedColorIndex === idx
                        ? "border-black bg-gray-100 text-black ring-2 ring-gray-300"
                        : "border-gray-300 hover:border-black text-gray-700"
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
            <h3 className="font-semibold text-gray-800">Số lượng:</h3>
            <Button
              variant="outline"
              size="icon"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="h-8 w-8 border-gray-300"
            >
              -
            </Button>
            <span className="text-lg font-semibold w-8 text-center text-gray-900">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity((q) => q + 1)}
              className="h-8 w-8 border-gray-300"
            >
              +
            </Button>
          </div>

          {/* Nút */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button
              variant="outline"
              className="flex-1 border-2 border-gray-800 text-gray-800 hover:bg-gray-100 hover:shadow-md transition-all"
              onClick={() => product && handleAddToCart(product, quantity)}
            >
              🛒 Thêm vào giỏ hàng
            </Button>
            <Button
              className="flex-1 bg-black hover:bg-gray-900 text-white shadow-md transition-all"
              onClick={() => alert('Chuyển đến trang thanh toán (chưa xử lý)')}
            >
              Mua ngay
            </Button>
          </div>
        </div>
      </div>

      {/* ==== Mô tả chi tiết ==== */}
      {product.detailDescription && (
        <div className="mt-16 border-t pt-10">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Mô tả chi tiết
          </h2>
          <p className="text-gray-700 leading-relaxed text-justify">
            {product.detailDescription}
          </p>
        </div>
      )}

      {/* ==== Thông số kỹ thuật ==== */}
      {product.specifications && (
        <div className="mt-10 border-t pt-10">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Thông số kỹ thuật
          </h2>
          <table className="w-full text-sm border border-gray-300 text-gray-800 rounded-xl overflow-hidden">
            <tbody>
              {product.specifications.map((spec, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium w-1/3 bg-gray-100">
                    {spec.label}
                  </td>
                  <td className="py-3 px-4">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==== Sản phẩm liên quan ==== */}
      {relatedProducts.length > 0 && (
        <section className="container py-16 border-t mt-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Sản phẩm liên quan
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {relatedProducts.map((item) => {
              const priceDisplay =
                item.discountPercent && item.discountPercent > 0
                  ? calculateDiscountedPrice(item.price, item.discountPercent)
                  : item.price;

              return (
                <Card
                  key={item.id}
                  className="flex flex-col group overflow-hidden border border-gray-200 hover:border-black shadow-sm hover:shadow-lg transition-all rounded-2xl"
                >
                  <Link to={`/product/${item.id}`}>
                    <CardHeader className="p-0 relative">
                      <div className="aspect-square bg-gray-50 flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    </CardHeader>
                  </Link>

                  <CardContent className="p-4 flex flex-col flex-grow">
                    <Link to={`/product/${item.id}`}>
                      <CardTitle className="text-base font-semibold mb-2 hover:text-black transition">
                        {item.name}
                      </CardTitle>
                    </Link>
                    <div className="mt-auto space-y-2">
                      <p className="text-black font-bold">
                        {formatPrice(priceDisplay)}
                      </p>
                      <Button
                        size="sm"
                        className="w-full bg-black text-white hover:bg-gray-800 transition"
                        onClick={() => handleAddToCart(product, 1)}
                      >
                        Thêm vào giỏ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
