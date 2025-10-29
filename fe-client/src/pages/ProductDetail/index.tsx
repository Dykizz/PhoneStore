import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
// Import CartItem từ context (đảm bảo context đã export nó)
import { useCart} from "@/contexts/cartContexts"; //
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

// Hàm định dạng giá
function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "₫";
}

// Hàm tính giá đã giảm
function calculateDiscountedPrice(price: number, discount: number): number {
  return price - (price * discount) / 100;
}

export default function ProductDetail() {
  const { id } = useParams(); // Lấy ID sản phẩm từ URL
  const [product, setProduct] = useState<DetailProduct | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  // SỬA 1: Thêm state để lưu chỉ số (index) của màu/ảnh đang chọn
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<BaseProduct[]>([]);

  // Lấy hàm addToCart từ context
  const { addToCart } = useCart(); //

  // useEffect để lấy dữ liệu chi tiết sản phẩm và sản phẩm liên quan khi ID thay đổi
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    // Tìm sản phẩm trong dữ liệu chi tiết dựa trên ID
    const foundProduct = detailProductData.find((p) => p.id === id);
    setProduct(foundProduct || null);

    // Set ảnh và chỉ số mặc định khi load sản phẩm
    if (foundProduct?.images && foundProduct.images.length > 0) {
      setSelectedImage(foundProduct.images[0]); // Ảnh đầu tiên
      setSelectedVariantIndex(0); // Index đầu tiên
    } else {
      setSelectedImage(foundProduct?.image || ""); // Ảnh chính nếu không có mảng images
      setSelectedVariantIndex(0); // Index mặc định
    }

    // Tìm sản phẩm liên quan (cùng thương hiệu)
    if (foundProduct) {
      const currentBrand = brands.find(
        (b) => b.name === foundProduct.brandName
      );
      if (currentBrand) {
        const related = productData.filter(
          (p) =>
            p.brandId === String(currentBrand.brandId) && // Cùng brandId
            p.id !== foundProduct.id // Loại trừ chính sản phẩm đang xem
        );
        setRelatedProducts(related);
      } else {
        setRelatedProducts([]);
      }
    } else {
      setRelatedProducts([]);
    }

    setQuantity(1); // Reset số lượng về 1
    setLoading(false); // Kết thúc loading
  }, [id]); // Chạy lại khi id thay đổi

  // SỬA 2: Sửa hàm handleAddToCart để gửi đúng dữ liệu biến thể
  const handleAddToCart = (
    e: React.MouseEvent,
    productToAdd: DetailProduct | BaseProduct, // Nhận cả object
    qty: number,
    selectedIndex: number // Nhận index của biến thể đã chọn
  ) => {
    e.stopPropagation();
    e.preventDefault();

    // --- Xác định thông tin biến thể ---
    let variantIdPart = "default"; // ID phụ mặc định
    let variantDisplayInfo = ""; // Thông tin hiển thị (vd: "Màu: Đen")
    let imageForCart = productToAdd.image; // Ảnh mặc định là ảnh chính

    // Kiểm tra xem sản phẩm có thông tin biến thể (màu sắc, ảnh) không
    if ('colors' in productToAdd && productToAdd.colors && productToAdd.colors[selectedIndex]) {
      const selectedColor = productToAdd.colors[selectedIndex];
      // Tạo ID phụ từ màu sắc (vd: "xanh-duong")
      variantIdPart = selectedColor.toLowerCase().replace(/\s+/g, '-');
      variantDisplayInfo = `Màu: ${selectedColor}`;
    } else if (productToAdd.name){
       // Nếu không có màu, có thể dùng 1 phần tên làm ID phụ (hoặc để "default")
       variantIdPart = productToAdd.name.toLowerCase().replace(/\s+/g, '-').substring(0,10);
    }

    // Lấy ảnh tương ứng với biến thể đã chọn
    if ('images' in productToAdd && productToAdd.images && productToAdd.images[selectedIndex]) {
      imageForCart = productToAdd.images[selectedIndex];
    }

    // --- Tính giá cuối cùng ---
    const finalPrice =
      productToAdd.discountPercent && productToAdd.discountPercent > 0
        ? calculateDiscountedPrice(productToAdd.price, productToAdd.discountPercent)
        : productToAdd.price;

    // --- Gọi hàm addToCart từ Context ---
    // Truyền object chứa thông tin cơ bản và variantIdPart riêng
    addToCart(
      { // Dữ liệu item (Omit<CartItem, 'cartItemId'>)
        productId: productToAdd.id, // ID gốc của sản phẩm
        quantity: qty,
        name: productToAdd.name,
        price: finalPrice, // Giá cuối cùng
        image: imageForCart, // Ảnh của biến thể
        variantInfo: variantDisplayInfo, // Thông tin biến thể để hiển thị
      },
      variantIdPart // ID phụ để tạo cartItemId duy nhất
    );

    // --- Thông báo ---
    alert(`Đã thêm ${qty} ${productToAdd.name} ${variantDisplayInfo ? `(${variantDisplayInfo})` : ''} vào giỏ hàng!`);
  };

  // --- Render phần Loading ---
  if (loading) {
    return (
      <div className="container py-8 text-center">
        <h1>Đang tải...</h1>
      </div>
    );
  }

  // --- Render phần Không tìm thấy sản phẩm ---
  if (!product) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-3xl font-bold">Sản phẩm không tồn tại</h1>
        <Link to="/" className="mt-4 inline-block">
          <Button variant="link">Quay lại trang chủ</Button>
        </Link>
      </div>
    );
  }

  // --- Các hàm xử lý UI ---
  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => { if (quantity > 1) setQuantity((prev) => prev - 1); };

  // SỬA 3: Sửa handleSelectColor để cập nhật cả index
  const handleSelectColor = (index: number) => {
    if (product.images && product.images[index]) {
      setSelectedImage(product.images[index]); // Cập nhật ảnh lớn
      setSelectedVariantIndex(index); // Cập nhật index đang chọn
    }
  };

  // Tính giá hiển thị chính
  const mainDisplayPrice =
    product.discountPercent && product.discountPercent > 0
      ? calculateDiscountedPrice(product.price, product.discountPercent)
      : product.price;

  // --- Render Giao diện ---
  return (
    <>
      {/* --- PHẦN CHI TIẾT SẢN PHẨM --- */}
      <div className="container py-10 flex flex-col lg:flex-row gap-10">
        {/* Cột trái: Hình ảnh sản phẩm */}
        <div className="flex flex-col lg:flex-row gap-6 w-full lg:w-2/3">
          {/* Danh sách ảnh nhỏ (thumbnails) */}
          <div className="flex lg:flex-col gap-3 order-2 lg:order-1">
            {/* Chỉ hiển thị thumbnails nếu có nhiều ảnh */}
            {product.images && product.images.length > 1 && product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectColor(idx)}
                // Highlight nút tương ứng với index đang chọn
                className={`border rounded-lg overflow-hidden w-20 h-20 transition-all duration-200 ${
                  selectedVariantIndex === idx // SỬA 4: So sánh index
                    ? "border-red-500 ring-2 ring-red-200" // Highlight rõ hơn
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <img
                  src={img}
                  alt={`Phiên bản ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Ảnh lớn */}
          <div className="flex-1 flex justify-center items-center border rounded-xl order-1 lg:order-2 bg-white shadow-sm min-h-[300px]">
            <img
              src={selectedImage}
              alt={product.name}
              className="max-h-[500px] object-contain rounded-lg p-4" // Thêm padding nhỏ
            />
          </div>
        </div>

        {/* Cột phải: Thông tin sản phẩm */}
        <div className="flex-1 space-y-6">
          {/* Tên sản phẩm */}
          <h1 className="text-3xl font-bold">{product.name}</h1>
          {/* Mô tả chi tiết */}
          <p className="text-gray-700">{product.detailDescription}</p>

          {/* Phần hiển thị giá */}
          <div>
            {product.discountPercent && product.discountPercent > 0 ? (
              <>
                <div className="text-3xl font-bold text-red-600">
                  {formatPrice(mainDisplayPrice)}
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
          </div>

          {/* Phần chọn màu (nếu có) */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Chọn màu:</h3>
              <div className="flex gap-3 flex-wrap">
                {product.colors.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectColor(idx)}
                    // Highlight nút màu tương ứng với index đang chọn
                    className={`px-4 py-2 border rounded-lg transition-all duration-200 ${
                      selectedVariantIndex === idx // SỬA 5: So sánh index
                        ? "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200" // Highlight rõ hơn
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Phần chọn số lượng */}
          <div className="flex items-center gap-4">
            <h3 className="font-semibold w-20">Số lượng:</h3> {/* Đặt width cố định */}
            {/* Nút giảm số lượng */}
            <Button
              variant="outline"
              size="icon" // Kích thước icon vuông
              onClick={decreaseQuantity}
              disabled={quantity <= 1} // Disable nếu số lượng là 1
              className="h-9 w-9" // Kích thước nhỏ hơn
            >
              -
            </Button>
            {/* Hiển thị số lượng hiện tại */}
            <span className="text-xl font-medium w-10 text-center">{quantity}</span>
            {/* Nút tăng số lượng */}
            <Button
              variant="outline"
              size="icon"
              onClick={increaseQuantity}
              className="h-9 w-9"
            >
              +
            </Button>
          </div>

          {/* Các nút hành động chính */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8"> {/* Layout flex cho nút */}
            {/* Nút Thêm vào giỏ hàng */}
            <Button
              variant="outline"
              size="lg"
              className="flex-1 border-2 border-primary text-primary hover:bg-primary/5 hover:text-primary" // Style nút outline
              onClick={(e) => {
                if (product) {
                  // SỬA 6: Truyền selectedVariantIndex
                  handleAddToCart(e, product, quantity, selectedVariantIndex);
                }
              }}
            >
              🛒 Thêm vào giỏ hàng
            </Button>

            {/* Nút Mua ngay */}
            <Button
              size="lg"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => alert("Chuyển đến trang thanh toán (Chưa làm)")}
            >
              Mua ngay
            </Button>
          </div>
        </div>
      </div>

      {/* --- PHẦN SẢN PHẨM LIÊN QUAN --- */}
      {relatedProducts.length > 0 && ( // Chỉ hiển thị nếu có sản phẩm liên quan
        <section className="container py-12 border-t mt-12">
          <h2 className="text-3xl font-bold text-center mb-8">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"> {/* Responsive grid */}
            {relatedProducts.map((relatedProd) => {
              const relatedDisplayPrice =
                relatedProd.discountPercent && relatedProd.discountPercent > 0
                  ? calculateDiscountedPrice(relatedProd.price, relatedProd.discountPercent)
                  : relatedProd.price;

              return (
                <Card key={relatedProd.id} className="h-full flex flex-col overflow-hidden group"> {/* Thêm group cho hover effect */}
                  <Link to={`/product/${relatedProd.id}`} className="block overflow-hidden">
                    <CardHeader className="p-0 relative"> {/* Ảnh chiếm hết header */}
                       {/* Tag giảm giá */}
                      {relatedProd.discountPercent && relatedProd.discountPercent > 0 && (
                        <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                          -{relatedProd.discountPercent}%
                        </div>
                      )}
                      {/* Ảnh sản phẩm */}
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={relatedProd.image}
                          alt={relatedProd.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" // Zoom nhẹ khi hover
                        />
                      </div>
                    </CardHeader>
                  </Link>

                  <CardContent className="p-4 flex flex-col flex-grow">
                     {/* Tên sản phẩm */}
                    <Link to={`/product/${relatedProd.id}`} className="block mb-2">
                       <CardTitle className="text-base font-semibold leading-snug hover:text-primary transition-colors">
                         {relatedProd.name}
                       </CardTitle>
                    </Link>
                     {/* Mô tả ngắn (nếu cần) */}
                    {/* <CardDescription className="text-xs mb-3">{relatedProd.baseDescription}</CardDescription> */}

                    {/* Phần giá và nút - đẩy xuống dưới cùng */}
                    <div className="mt-auto space-y-3 pt-3">
                       {/* Hiển thị giá */}
                      <div>
                        {relatedProd.discountPercent && relatedProd.discountPercent > 0 ? (
                          <>
                            <p className="text-lg font-bold text-red-600">
                              {formatPrice(relatedDisplayPrice)}
                            </p>
                            <p className="text-xs text-gray-500 line-through h-4"> {/* Đảm bảo chiều cao */}
                              {formatPrice(relatedProd.price)}
                            </p>
                          </>
                        ) : (
                          <>
                             <p className="text-lg font-bold text-red-600">
                               {formatPrice(relatedProd.price)}
                             </p>
                             <p className="text-xs h-4">&nbsp;</p> {/* Giữ chỗ */}
                          </>
                        )}
                      </div>
                       {/* Nút Thêm sản phẩm */}
                      <Button
                        className="w-full"
                        size="sm" // Kích thước nhỏ hơn
                        onClick={(e) =>
                          // SỬA 7: Thêm sản phẩm liên quan (mặc định index 0)
                          handleAddToCart(e, relatedProd, 1, 0)
                        }
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
    </>
  );
}

