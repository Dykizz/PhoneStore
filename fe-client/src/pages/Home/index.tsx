<<<<<<< HEAD
=======
// // fe-client/src/pages/Home/index.tsx

>>>>>>> origin/main
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
<<<<<<< HEAD
// import { productData, type BaseProduct } from "@/data";
=======
// // import { productData, type BaseProduct } from "@/data"; // <== SỬA ĐỔI: Xóa data tĩnh
// import type { Product } from "@/data"; // <== SỬA ĐỔI: Import kiểu Product
// import { fetchProducts } from "@/apis/product.api"; // <== SỬA ĐỔI: Import hàm API
>>>>>>> origin/main
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
<<<<<<< HEAD
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
=======
//   // <== SỬA ĐỔI: Dùng kiểu "Product" (từ data.ts) cho state
//   const [products, setProducts] = useState<Product[]>([]);
//   // <== SỬA ĐỔI: Thêm state cho loading và error
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const { addToCart } = useCart();

//   // Hàm xử lý thêm sản phẩm vào giỏ hàng (Cần xem lại logic khi có API)
//   const handleAddToCart = (
//     e: React.MouseEvent,
//     productToAdd: Product, // <== SỬA ĐỔI: Dùng kiểu Product
//     qty: number,
//     selectedIndex: number // selectedIndex giờ là index của variant
//   ) => {
//     e.stopPropagation();
//     e.preventDefault();

//     // <== SỬA ĐỔI: Logic lấy thông tin từ variant
//     const selectedVariant = productToAdd.variants[selectedIndex];
//     if (!selectedVariant) return; // Không có variant thì không làm gì cả

//     let variantIdPart = selectedVariant.id || "default";
//     let variantDisplayInfo = `Phiên bản: ${selectedVariant.name}`;
//     let imageForCart = selectedVariant.image; // Lấy ảnh từ variant

//     // <== SỬA ĐỔI: API thật không có discountPercent, tạm thời bỏ qua
//     const finalPrice = selectedVariant.price;

//     // Thêm sản phẩm vào giỏ
//     addToCart(
//       {
//         productId: productToAdd.id,
//         quantity: qty,
//         name: productToAdd.name,
//         price: finalPrice,
//         image: imageForCart,
//         variantInfo: variantDisplayInfo,
//       },
//       variantIdPart
//     );

//     alert(
//       `Đã thêm ${qty} ${productToAdd.name} (${variantDisplayInfo}) vào giỏ hàng!`
//     );
//   };

//   // <== SỬA ĐỔI: Hàm tải sản phẩm từ API
//   useEffect(() => {
//     const loadProducts = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         // Gọi API thật
//         const apiProducts = await fetchProducts();
//         setProducts(apiProducts);
//       } catch (error) {
//         console.error("Lỗi khi tải sản phẩm:", error);
//         setError(
//           error instanceof Error ? error.message : "Lỗi không xác định"
//         );
//       } finally {
//         setIsLoading(false);
>>>>>>> origin/main
//       }
//     };

//     loadProducts();
//   }, []);

<<<<<<< HEAD
//   return (
//     <div className="container py-8">
//       {/* Phần giới thiệu */}
=======
//   // <== SỬA ĐỔI: Xử lý giao diện khi đang tải hoặc lỗi
//   if (isLoading) {
//     return (
//       <div className="container py-8 text-center">Đang tải sản phẩm...</div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container py-8 text-center text-red-600">
//         Lỗi khi tải sản phẩm: {error}
//       </div>
//     );
//   }
//   // --- Hết phần xử lý loading/error ---

//   return (
//     <div className="container py-8">
//       {/* Phần giới thiệu (Giữ nguyên) */}
>>>>>>> origin/main
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
<<<<<<< HEAD
//           {/* Lặp qua danh sách sản phẩm */}
//           {products.map((product) => {
//             // Tính giá hiển thị (để render ra giao diện)
//             const displayPrice =
//               product.discountPercent && product.discountPercent > 0
//                 ? calculateDiscountedPrice(product.price, product.discountPercent)
//                 : product.price;
=======
//           {/* Lặp qua danh sách sản phẩm từ API */}
//           {products.map((product) => {
//             // <== SỬA ĐỔI: Lấy thông tin từ variant đầu tiên để hiển thị
//             const firstVariant = product.variants[0];

//             // Nếu sản phẩm không có variant nào, không hiển thị
//             if (!firstVariant) {
//               return null;
//             }

//             // <== SỬA ĐỔI: API thật không có discount, tạm gán
//             const discountPercent = product.discountPercent || 0;
//             const displayPrice =
//               discountPercent > 0
//                 ? calculateDiscountedPrice(firstVariant.price, discountPercent)
//                 : firstVariant.price;
>>>>>>> origin/main

//             return (
//               // Mỗi sản phẩm là một Card
//               <Card key={product.id} className="h-full flex flex-col">
//                 {/* Phần Header Card (Tên, mô tả ngắn) */}
//                 <Link to={`/product/${product.id}`}>
//                   <CardHeader>
//                     <CardTitle>{product.name}</CardTitle>
<<<<<<< HEAD
//                     <CardDescription>{product.baseDescription}</CardDescription>
=======
//                     {/* <== SỬA ĐỔI: Dùng "description" từ API */}
//                     <CardDescription>{product.description}</CardDescription>
>>>>>>> origin/main
//                   </CardHeader>
//                 </Link>

//                 {/* Phần Content Card (Ảnh, Giá, Nút) */}
//                 <CardContent className="flex flex-col flex-grow">
//                   {/* Link bao quanh ảnh */}
//                   <Link to={`/product/${product.id}`} className="block">
//                     <div className="aspect-square bg-muted rounded-lg mb-4 relative">
<<<<<<< HEAD
//                       {/* Ảnh sản phẩm */}
//                       <img
//                         src={product.image}
=======
//                       {/* <== SỬA ĐỔI: Lấy ảnh từ variant đầu tiên */}
//                       <img
//                         src={firstVariant.image}
>>>>>>> origin/main
//                         alt={product.name}
//                         className="w-full h-full object-cover rounded-lg"
//                       />
//                       {/* Tag giảm giá (nếu có) */}
<<<<<<< HEAD
//                       {product.discountPercent && product.discountPercent > 0 && (
//                         <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
//                           -{product.discountPercent}%
=======
//                       {discountPercent > 0 && (
//                         <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
//                           -{discountPercent}%
>>>>>>> origin/main
//                         </div>
//                       )}
//                     </div>
//                   </Link>

//                   {/* Phần dưới cùng của Card (Giá và Nút) */}
//                   <div className="mt-auto">
//                     {/* Hiển thị giá */}
<<<<<<< HEAD
//                     {product.discountPercent && product.discountPercent > 0 ? (
=======
//                     {discountPercent > 0 ? (
>>>>>>> origin/main
//                       // Trường hợp có giảm giá
//                       <>
//                         <div className="text-3xl font-bold text-red-600">
//                           {formatPrice(displayPrice)}
//                         </div>
//                         <div className="text-xl text-gray-500 line-through">
<<<<<<< HEAD
//                           {formatPrice(product.price)} {/* Giá gốc */}
=======
//                           {/* <== SỬA ĐỔI: Lấy giá gốc từ variant */}
//                           {formatPrice(firstVariant.price)}
>>>>>>> origin/main
//                         </div>
//                       </>
//                     ) : (
//                       // Trường hợp không giảm giá
//                       <div className="text-3xl font-bold text-red-600">
<<<<<<< HEAD
//                         {formatPrice(product.price)}
=======
//                         {/* <== SỬA ĐỔI: Lấy giá từ variant */}
//                         {formatPrice(firstVariant.price)}
>>>>>>> origin/main
//                       </div>
//                     )}

//                     {/* Nút Thêm sản phẩm */}
//                     <Button
//                       className="w-full mt-4"
<<<<<<< HEAD
//                       onClick={(e) => handleAddToCart(e, product, 1)} // Truyền số lượng khi thêm vào giỏ
=======
//                       // <== SỬA ĐỔI: Truyền variant index (0) vào
//                       onClick={(e) => handleAddToCart(e, product, 1, 0)}
>>>>>>> origin/main
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

<<<<<<< HEAD




=======
// fe-client/src/pages/Home/index.tsx
>>>>>>> origin/main

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
<<<<<<< HEAD
import { useCart } from "@/contexts/cartContexts";
import type { BaseProduct } from "@/types/product.type";
import { getProducts } from "@/apis/product.api";
import { QueryBuilder } from "@/utils/queryBuilder";
import { showToast } from "@/utils/toast";
=======
import type { Product } from "@/data";
import { fetchProducts } from "@/apis/product.api";
import { useCart } from "@/contexts/cartContexts";
import { useQueryPagination } from "@/hooks/useQueryPagination"; // <== SỬA ĐỔI: Import hook query
>>>>>>> origin/main

// Hàm định dạng giá
function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "₫";
}

// Hàm tính giá đã giảm
function calculateDiscountedPrice(price: number, discount: number): number {
  return price - (price * discount) / 100;
}

export function Home() {
<<<<<<< HEAD
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
=======
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addToCart } = useCart();

  // <== SỬA ĐỔI: Dùng hook để lấy tham số query,
  // ví dụ: lấy 9 sản phẩm ở trang 1
  const { queryParams } = useQueryPagination({
    page: 1,
    limit: 9,
  });

  // Hàm xử lý thêm sản phẩm vào giỏ hàng (Giữ nguyên)
  const handleAddToCart = (
    e: React.MouseEvent,
    productToAdd: Product,
    qty: number,
    selectedIndex: number
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const selectedVariant = productToAdd.variants[selectedIndex];
    if (!selectedVariant) return;

    const variantIdPart = selectedVariant.id || "default";
    const variantDisplayInfo = `Phiên bản: ${selectedVariant.name}`;
    const imageForCart = selectedVariant.image;

    const finalPrice = selectedVariant.price;

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

  // <== SỬA ĐỔI: Hàm tải sản phẩm từ API
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Gọi API thật và truyền queryParams vào
        const apiProducts = await fetchProducts(queryParams);
        setProducts(apiProducts);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        setError(
          error instanceof Error ? error.message : "Lỗi không xác định"
        );
>>>>>>> origin/main
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [queryParams]); // <== SỬA ĐỔI: Thêm queryParams vào dependencies

  // <== SỬA ĐỔI: Xử lý giao diện khi đang tải hoặc lỗi
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
  // --- Hết phần xử lý loading/error ---

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
<<<<<<< HEAD
            const displayPrice =
              product.discount ?
                 calculateDiscountedPrice(product.price, product.discount.discountPercent)
                : product.price;
=======
            // <== SỬA ĐỔI: Thêm kiểm tra an toàn, tránh crash
            const firstVariant =
              product.variants && product.variants.length > 0
                ? product.variants[0]
                : undefined;

            // Nếu sản phẩm không có variant nào, không hiển thị
            if (!firstVariant) {
              return null;
            }

            // <== SỬA ĐỔI: API thật không có discount, tạm gán
            const discountPercent = product.discountPercent || 0;
            const displayPrice =
              discountPercent > 0
                ? calculateDiscountedPrice(firstVariant.price, discountPercent)
                : firstVariant.price;
>>>>>>> origin/main

            return (
              // Mỗi sản phẩm là một Card
              <Card key={product.id} className="h-full flex flex-col">
                {/* Phần Header Card (Tên, mô tả ngắn) */}
                <Link to={`/product/${product.id}`}>
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
<<<<<<< HEAD
                    {/* Dùng "description" từ API (động) */}
                    <CardDescription>Mo ta</CardDescription>
=======
                    {/* <== SỬA ĐỔI: Dùng "description" từ API */}
                    <CardDescription>{product.description}</CardDescription>
>>>>>>> origin/main
                  </CardHeader>
                </Link>

                {/* Phần Content Card (Ảnh, Giá, Nút) */}
                <CardContent className="flex flex-col flex-grow">
                  {/* Link bao quanh ảnh */}
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="aspect-square bg-muted rounded-lg mb-4 relative">
<<<<<<< HEAD
                      {/* Lấy ảnh từ variant đầu tiên */}
=======
                      {/* <== SỬA ĐỔI: Lấy ảnh từ variant đầu tiên */}
>>>>>>> origin/main
                      <img
                        src={firstVariant.image}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {/* Tag giảm giá (nếu có) */}
<<<<<<< HEAD
                      {product.discount  && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                          -{product.discount.discountPercent}%
=======
                      {discountPercent > 0 && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                          -{discountPercent}%
>>>>>>> origin/main
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Phần dưới cùng của Card (Giá và Nút) */}
                  <div className="mt-auto">
                    {/* Hiển thị giá */}
<<<<<<< HEAD
                    {product.discount ? (
=======
                    {discountPercent > 0 ? (
                      // Trường hợp có giảm giá
>>>>>>> origin/main
                      <>
                        <div className="text-3xl font-bold text-red-600">
                          {formatPrice(displayPrice)}
                        </div>
                        <div className="text-xl text-gray-500 line-through">
<<<<<<< HEAD
                          {/* Lấy giá gốc từ variant */}
                          {formatPrice(product.price)}
=======
                          {/* <== SỬA ĐỔI: Lấy giá gốc từ variant */}
                          {formatPrice(firstVariant.price)}
>>>>>>> origin/main
                        </div>
                      </>
                    ) : (
                      // Trường hợp không giảm giá
                      <div className="text-3xl font-bold text-red-600">
<<<<<<< HEAD
                        {/* Lấy giá từ variant */}
                        {formatPrice(product.price)}
=======
                        {/* <== SỬA ĐỔI: Lấy giá từ variant */}
                        {formatPrice(firstVariant.price)}
>>>>>>> origin/main
                      </div>
                    )}

                    {/* Nút Thêm sản phẩm */}
                    <Button
                      className="w-full mt-4"
<<<<<<< HEAD
                      // Truyền variant index (0) vào
=======
                      // <== SỬA ĐỔI: Truyền variant index (0) vào
>>>>>>> origin/main
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