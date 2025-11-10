"use client";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/contexts/cartContexts";
import { formatCurrencyVND } from "@/utils/util";
import { getProduct, getProducts } from "@/apis/product.api";
import type { BaseProduct, DetailProduct } from "@/types/product.type";
import { QueryBuilder } from "@/utils/queryBuilder";
import Product from "../Products/Product";
import { showToast } from "@/utils/toast";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<DetailProduct | null>(null);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<BaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const navigeta = useNavigate();

  const { addToCart, cartItems } = useCart();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetchRelatedProducts = async (
      productTypeId: string,
      brandId: string
    ) => {
      const query = QueryBuilder.create()
        .page(1)
        .limit(4)
        .filterIf(!!brandId, "brandId", brandId)
        .filterIf(!!productTypeId, "productTypeId", productTypeId)
        .filterNot("id", id!)
        .build();

      const response = await getProducts(query);
      if (response.success) {
        setRelatedProducts(response.data.data);
      }
    };

    const fetchProduct = async () => {
      const response = await getProduct(id!);
      if (response.success) {
        setProduct(response.data);
        if (response.data.quantity <= 0) {
          setQuantity(0);
        }
        fetchRelatedProducts(
          response.data.productTypeId,
          response.data.brandId
        );
      }
    };

    try {
      setLoading(true);
      fetchProduct();
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    setQuantity((prev) =>
      Math.min(
        Math.max(prev, 1),
        product ? product.variants[selectedVariantIdx].quantity : 1
      )
    );
  }, [selectedVariantIdx]);

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

  const displayPrice = product.discount?.discountPercent
    ? ((100 - product.discount.discountPercent) * product.price) / 100
    : product.price;

  const handleAddToCart = () => {
    if (isAdding) return;
    const selectedVariant = product.variants[selectedVariantIdx];
    const selectedVariantId = selectedVariant.id!;
    const availableQuantity = selectedVariant.quantity;

    const existingItem = cartItems.find(
      (item) => item.variantId === selectedVariantId
    );
    const totalInCart = existingItem ? existingItem.quantity : 0;
    const canAdd = availableQuantity - totalInCart;
    setIsAdding(true);
    if (totalInCart + quantity > availableQuantity) {
      showToast({
        type: "error",
        title: "Không đủ hàng",
        description: `Bạn đã có ${totalInCart} sản phẩm trong giỏ. ${
          canAdd > 0
            ? `Chỉ thêm được ${canAdd} sản phẩm!`
            : `Không thể thêm được nữa!`
        } `,
      });
      setIsAdding(false);
      return;
    }

    const cartItem: CartItem = {
      variantId: selectedVariantId,
      productId: product.id,
      quantity,
      name: product.name,
      price: product.price,
      finalPrice: displayPrice,
      image: selectedVariant.image,
      color: selectedVariant.color,
      maxQuantity: selectedVariant.quantity,
    };

    addToCart(cartItem);

    showToast({
      type: "success",
      title: "Thêm vào giỏ hàng",
      description: `Đã thêm ${quantity} ${product.name} ${selectedVariant.color} vào giỏ hàng!`,
    });
    setTimeout(() => setIsAdding(false), 300);
  };

  return (
    <div className="container py-10">
      {/* ==== ẢNH & THÔNG TIN ==== */}
      <div className="flex flex-col lg:flex-row gap-10 bg-white rounded-2xl shadow-md p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-6 w-full lg:w-2/3">
          <div className="flex lg:flex-col gap-3 order-2 lg:order-1">
            {product.variants?.map((variant, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedVariantIdx(idx)}
                className={`border rounded-xl overflow-hidden w-20 h-20 transition-all duration-300 ${
                  idx === selectedVariantIdx
                    ? "border-black ring-2 ring-gray-300 scale-105"
                    : "border-gray-300 hover:border-black"
                }`}
              >
                <img
                  src={variant.image}
                  alt={variant.color}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          <div className="flex-1 flex justify-center items-center border rounded-2xl bg-gray-50 shadow-inner order-1 lg:order-2">
            <img
              src={product.variants[selectedVariantIdx].image}
              alt={product.name}
              className="max-h-[480px] object-contain p-4 transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>

        {/* Thông tin */}
        <div className="flex-1 space-y-5">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-600">{product.baseDescription}</p>

          {/* Giá */}
          <div>
            {product.discount?.discountPercent ? (
              <>
                <div className="text-4xl font-bold text-gray-900">
                  {formatCurrencyVND(displayPrice)}
                </div>
                <div className="text-lg text-gray-400 line-through">
                  {formatCurrencyVND(product.price)}
                </div>
              </>
            ) : (
              <div className="text-4xl font-bold text-gray-900">
                {formatCurrencyVND(product.price)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            {product.variants[selectedVariantIdx].quantity > 0 ? (
              <span>
                <strong>Kho:</strong>{" "}
                {product.variants[selectedVariantIdx].quantity}
              </span>
            ) : (
              <span className="text-red-500 font-bold">Hết hàng</span>
            )}

            <span>
              <strong>Đã bán:</strong>{" "}
              {product.variants[selectedVariantIdx].quantitySold}
            </span>
          </div>

          {/* Màu */}
          {product.variants && (
            <div>
              <h3 className="font-semibold mb-2 text-gray-800">Chọn màu:</h3>
              <div className="flex gap-3 flex-wrap">
                {product.variants.map((variant, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedVariantIdx(idx)}
                    className={`px-4 py-2 border rounded-full text-sm transition-all ${
                      idx === selectedVariantIdx
                        ? "border-black bg-gray-100 text-black ring-2 ring-gray-300"
                        : "border-gray-300 hover:border-black text-gray-700"
                    }`}
                  >
                    {variant.color}
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
              disabled={
                quantity >= product.variants[selectedVariantIdx].quantity
              }
              onClick={() =>
                setQuantity((q) =>
                  Math.min(q + 1, product.variants[selectedVariantIdx].quantity)
                )
              }
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
              onClick={handleAddToCart}
              disabled={product.variants[selectedVariantIdx].quantity <= 0}
            >
              {isAdding ? "Đang thêm..." : "🛒 Thêm vào giỏ hàng"}
            </Button>
            <Button
              className="flex-1 bg-black hover:bg-gray-900 text-white shadow-md transition-all"
              onClick={() => {
                handleAddToCart();
                navigeta("/cart");
              }}
              disabled={product.variants[selectedVariantIdx].quantity <= 0}
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
              return <Product key={item.id} product={item} />;
            })}
          </div>
        </section>
      )}
    </div>
  );
}
