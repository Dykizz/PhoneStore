// import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";
// import React, { useState, useEffect } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { productData, type BaseProduct } from "@/data";
// import { useCart } from "@/contexts/cartContexts";

// // Hàm định dạng giá
// function formatPrice(price: number) {
//   return price.toLocaleString("vi-VN") + "₫";
// }

// // Hàm tính giá đã giảm
// function calculateDiscountedPrice(price: number, discount: number): number {
//   return price - (price * discount) / 100;
// }

// export function Home() {
//   const [products, setProducts] = useState<BaseProduct[]>([]);
//   const { addToCart } = useCart();

//   // Hàm xử lý thêm sản phẩm vào giỏ hàng
//  const handleAddToCart = (
//   e: React.MouseEvent,
//   productToAdd: DetailProduct | BaseProduct,
//   qty: number,
//   selectedIndex: number
// ) => {
//   e.stopPropagation();
//   e.preventDefault();

//   let variantIdPart = "default";
//   let variantDisplayInfo = "";
//   let imageForCart = productToAdd.image;

//   // Cập nhật biến thể (ví dụ: màu sắc)
//   if ('colors' in productToAdd && productToAdd.colors && productToAdd.colors[selectedIndex]) {
//     const selectedColor = productToAdd.colors[selectedIndex];
//     variantIdPart = selectedColor.toLowerCase().replace(/\s+/g, '-');
//     variantDisplayInfo = `Màu: ${selectedColor}`;
//   }

//   // Tính giá cuối cùng
//   const finalPrice = productToAdd.discountPercent && productToAdd.discountPercent > 0
//     ? calculateDiscountedPrice(productToAdd.price, productToAdd.discountPercent)
//     : productToAdd.price;

//   // Thêm sản phẩm vào giỏ
//   addToCart({
//     productId: productToAdd.id,
//     quantity: qty,
//     name: productToAdd.name,
//     price: finalPrice,
//     image: imageForCart,
//     variantInfo: variantDisplayInfo,
//   }, variantIdPart);

//   alert(`Đã thêm ${qty} ${productToAdd.name} ${variantDisplayInfo ? `(${variantDisplayInfo})` : ''} vào giỏ hàng!`);
// };

//   // Hàm tải sản phẩm từ dữ liệu
//   useEffect(() => {
//     const loadProducts = async () => {
//       try {
//         setProducts(productData); // Giả sử bạn có data sẵn
//       } catch (error) {
//         console.error("Lỗi khi tải sản phẩm:", error);
//       }
//     };

//     loadProducts();
//   }, []);

//   return (
//     <div className="container py-8">
//       {/* Phần giới thiệu */}
//       <section className="text-center py-12">
//         <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
//           Welcome to Phone Store
//         </h1>
//         <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
//           Discover the latest smartphones, accessories, and tech gadgets at
//           unbeatable prices.
//         </p>
//         <div className="mt-10">
//           <Button size="lg" className="mr-4">
//             Mua ngay
//           </Button>
//           <Button variant="outline" size="lg">
//             Xem thêm
//           </Button>
//         </div>
//       </section>

//       {/* Phần sản phẩm nổi bật */}
//       <section className="py-12">
//         <h2 className="text-3xl font-bold text-center mb-8">Sản phẩm nổi bật</h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Lặp qua danh sách sản phẩm */}
//           {products.map((product) => {
//             // Tính giá hiển thị (để render ra giao diện)
//             const displayPrice =
//               product.discountPercent && product.discountPercent > 0
//                 ? calculateDiscountedPrice(product.price, product.discountPercent)
//                 : product.price;

//             return (
//               // Mỗi sản phẩm là một Card
//               <Card key={product.id} className="h-full flex flex-col">
//                 {/* Phần Header Card (Tên, mô tả ngắn) */}
//                 <Link to={`/product/${product.id}`}>
//                   <CardHeader>
//                     <CardTitle>{product.name}</CardTitle>
//                     <CardDescription>{product.baseDescription}</CardDescription>
//                   </CardHeader>
//                 </Link>

//                 {/* Phần Content Card (Ảnh, Giá, Nút) */}
//                 <CardContent className="flex flex-col flex-grow">
//                   {/* Link bao quanh ảnh */}
//                   <Link to={`/product/${product.id}`} className="block">
//                     <div className="aspect-square bg-muted rounded-lg mb-4 relative">
//                       {/* Ảnh sản phẩm */}
//                       <img
//                         src={product.image}
//                         alt={product.name}
//                         className="w-full h-full object-cover rounded-lg"
//                       />
//                       {/* Tag giảm giá (nếu có) */}
//                       {product.discountPercent && product.discountPercent > 0 && (
//                         <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
//                           -{product.discountPercent}%
//                         </div>
//                       )}
//                     </div>
//                   </Link>

//                   {/* Phần dưới cùng của Card (Giá và Nút) */}
//                   <div className="mt-auto">
//                     {/* Hiển thị giá */}
//                     {product.discountPercent && product.discountPercent > 0 ? (
//                       // Trường hợp có giảm giá
//                       <>
//                         <div className="text-3xl font-bold text-red-600">
//                           {formatPrice(displayPrice)}
//                         </div>
//                         <div className="text-xl text-gray-500 line-through">
//                           {formatPrice(product.price)} {/* Giá gốc */}
//                         </div>
//                       </>
//                     ) : (
//                       // Trường hợp không giảm giá
//                       <div className="text-3xl font-bold text-red-600">
//                         {formatPrice(product.price)}
//                       </div>
//                     )}

//                     {/* Nút Thêm sản phẩm */}
//                     <Button
//                       className="w-full mt-4"
//                       onClick={(e) => handleAddToCart(e, product, 1)} // Truyền số lượng khi thêm vào giỏ
//                     >
//                       Thêm sản phẩm
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>
//       </section>
//     </div>
//   );
// }






// fe-client/src/pages/Home/index.tsx

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
import { useCart } from "@/contexts/cartContexts";
import type { BaseProduct } from "@/types/product.type";
import { getProducts } from "@/apis/product.api";
import { QueryBuilder } from "@/utils/queryBuilder";
import { showToast } from "@/utils/toast";

// Hàm định dạng giá
function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "₫";
}

// Hàm tính giá đã giảm
function calculateDiscountedPrice(price: number, discount: number): number {
  return price - (price * discount) / 100;
}

export function Home() {
  const [products, setProducts] = useState<BaseProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  // Hàm xử lý thêm sản phẩm vào giỏ hàng (sửa để dùng 'variants')
  const handleAddToCart = (
    e: React.MouseEvent,
    productToAdd: BaseProduct, // Dùng kiểu Product (động)
    qty: number,
    selectedIndex: number // index của variant
  ) => {
    e.stopPropagation();
    e.preventDefault();

    // Logic lấy thông tin từ variant
    const selectedVariant = productToAdd.variants[selectedIndex];
    if (!selectedVariant) return; // An toàn nếu không có variant

    let variantIdPart = selectedVariant.id || "default";
    let variantDisplayInfo = `Phiên bản: ${selectedVariant.name}`;
    let imageForCart = selectedVariant.image; // Lấy ảnh từ variant

    // API thật không có discountPercent ở gốc, ta lấy giá từ variant
    const finalPrice = selectedVariant.price;

    // Thêm sản phẩm vào giỏ
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
      console.log("tai sp")
      try {
         const query = QueryBuilder.create()
        .page(1)
        .limit(4)
        .build();

        const response = await getProducts(query);
        if (!response.success){
          throw new Error(response.message);
        }
        setProducts(response.data.data);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        showToast({
          title: "Lỗi",
          description: "Lỗi khi tải sản phẩm"
        })
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Xử lý giao diện khi đang tải hoặc lỗi
  if (isLoading) {
    return (
      <div className="container py-8 text-center">Đang tải sản phẩm...</div>
    );
  }



  return (
    <div className="container py-8">
      {/* Phần giới thiệu (Giữ nguyên) */}
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
          {/* Lặp qua danh sách sản phẩm từ API */}
          {products.map((product) => {
            const displayPrice =
              product.discount ?
                 calculateDiscountedPrice(product.price, product.discount.discountPercent)
                : product.price;

            return (
              // Mỗi sản phẩm là một Card
              <Card key={product.id} className="h-full flex flex-col">
                {/* Phần Header Card (Tên, mô tả ngắn) */}
                <Link to={`/product/${product.id}`}>
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    {/* Dùng "description" từ API (động) */}
                    <CardDescription>Mo ta</CardDescription>
                  </CardHeader>
                </Link>

                {/* Phần Content Card (Ảnh, Giá, Nút) */}
                <CardContent className="flex flex-col flex-grow">
                  {/* Link bao quanh ảnh */}
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="aspect-square bg-muted rounded-lg mb-4 relative">
                      {/* Lấy ảnh từ variant đầu tiên */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {/* Tag giảm giá (nếu có) */}
                      {product.discount  && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                          -{product.discount.discountPercent}%
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Phần dưới cùng của Card (Giá và Nút) */}
                  <div className="mt-auto">
                    {/* Hiển thị giá */}
                    {product.discount ? (
                      <>
                        <div className="text-3xl font-bold text-red-600">
                          {formatPrice(displayPrice)}
                        </div>
                        <div className="text-xl text-gray-500 line-through">
                          {/* Lấy giá gốc từ variant */}
                          {formatPrice(product.price)}
                        </div>
                      </>
                    ) : (
                      // Trường hợp không giảm giá
                      <div className="text-3xl font-bold text-red-600">
                        {/* Lấy giá từ variant */}
                        {formatPrice(product.price)}
                      </div>
                    )}

                    {/* Nút Thêm sản phẩm */}
                    <Button
                      className="w-full mt-4"
                      // Truyền variant index (0) vào
                      onClick={(e) => handleAddToCart(e, product, 1, 0)}
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