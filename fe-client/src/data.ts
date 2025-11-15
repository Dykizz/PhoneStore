import ip15_den from "./assets/ip15_den.webp";
import ip15_xanhduong from "./assets/ip15_xanhduong.webp";
import ip15_xanhla from "./assets/ip15_xanhla.webp";
import ip15_hong from "./assets/ip15_hong.webp";
import ip16_den from "./assets/ip16_den.webp";
import ip16_trang from "./assets/ip16_trang.webp";
import ip16_hong from "./assets/ip16_hong.webp";
import ip16_xanhluuly from "./assets/ip16_xanhluuly.webp";
import ip16_xanhmongket from "./assets/ip16_xanhmongket.webp";
import ip17promax_bac from "./assets/ip17promax_bac.webp";
import ip17promax_camvutru from "./assets/ip17promax_camvutru.webp";
import ip17promax_xanhdam from "./assets/ip17promax_xanhdam.webp";

/* -------------------------- ProductType -------------------------- */
export type ProductType = {
  ptId: number; // khóa chính
  name: string; // tên loại sản phẩm (ví dụ: iPhone, iPad,...)
  description?: string;
};

/* -------------------------- DiscountPolicy ----------------------- */
export type DiscountPolicy = {
  dpId: number; // khóa chính
  discountPercent: number; // phần trăm giảm giá
  startDate: string; // ngày bắt đầu
  endDate: string; // ngày kết thúc
};

/* -------------------------- Product ------------------------------ */
export interface BaseProduct {
  id: string;
  name: string;
  price: number;
  isReleased: boolean;
  image: string;
  discountPercent?: number;
  baseDescription?: string;
  quantitySold: number;
  quantity: number;
  productTypeId: string;
  brandId: string;
}

export interface DetailProduct
  extends Omit<BaseProduct, "image" | "brandId" | "productTypeId"> {
  detailDescription?: string;

  // 🔹 Thêm hai dòng này:
  highlights?: string[];
  specifications?: {
    label: string;
    value: string;
  }[];

  images?: string[];
  colors?: string[];
  brandName: string;
  productTypeName: string;
}

/* -------------------------- Supplier ----------------------------- */
export type Brand = {
  brandId: number;
  name: string;
  description?: string;
};

/* -------------------------- Supplier ----------------------------- */
export type Supplier = {
  supplierId: number;
  name: string;
  description?: string;
};

/* -------------------------- GoodsReceipt ------------------------- */
export type GoodsReceipt = {
  grId: number;
  importTime: string; // ngày nhập
  employeeRecord: string; // nhân viên nhập
  supplierId: number; // khóa ngoại → Supplier
};

/* -------------------------- GoodsReceiptDetail ------------------- */
export type GoodsReceiptDetail = {
  grId: number;
  id: number;
  amount: number;
  price: number;
  note?: string;
};

/* -------------------------- User ----------------------------- */
export type User = {
  id: number;
  userName: string;
  email: string;
  password: string;
  role: "admin" | "customer";
  defaultAddress?: string;
};

/* -------------------------- Order ----------------------------- */
export type Order = {
  orderId: number;
  userId: number;
  time: string;
  paymentMethod: string;
  status: "pending" | "confirmed" | "shipped" | "completed" | "cancelled";
  shipAddress: string;
  note?: string;
  contactPhoneNumber: string;
  totalprice: number;
};

/* -------------------------- OrderDetail ------------------------ */
export type OrderDetail = {
  orderId: number;
  id: number;
  amount: number;
  price: number;
};

/* -------------------------- DỮ LIỆU MẪU ------------------------- */
export const productTypes: ProductType[] = [
  { ptId: 1, name: "iPhone", description: "Điện thoại Apple" },
  { ptId: 2, name: "iPad", description: "Máy tính bảng Apple" },
];

export const discountPolicies: DiscountPolicy[] = [
  {
    dpId: 1,
    discountPercent: 10,
    startDate: "2025-10-01",
    endDate: "2025-11-01",
  },
];

export const productData: BaseProduct[] = [
  // ===== iPhone 15 series =====
  {
    id: "1",
    name: "iPhone 15 128GB | Chính hãng VN/A",
    price: 17390000,
    isReleased: true,
    image: ip15_xanhduong,
    quantitySold: 1000,
    quantity: 500,
    productTypeId: "1",
    brandId: "1",
    discountPercent: 10,
    baseDescription: "Flagship mạnh mẽ với chip A16 Bionic, camera 48MP.",
  },
  {
    id: "2",
    name: "iPhone 15 256GB | Chính hãng VN/A",
    price: 19390000,
    isReleased: true,
    image: ip15_den,
    quantitySold: 700,
    quantity: 400,
    productTypeId: "1",
    brandId: "1",
    discountPercent: 8,
    baseDescription: "Phiên bản nâng cấp dung lượng, hiệu năng vượt trội.",
  },
  {
    id: "3",
    name: "iPhone 15 512GB | Chính hãng VN/A",
    price: 22990000,
    isReleased: true,
    image: ip15_hong,
    quantitySold: 500,
    quantity: 300,
    productTypeId: "1",
    brandId: "1",
    discountPercent: 5,
    baseDescription: "Thiết kế trẻ trung, hiệu suất mạnh mẽ và lưu trữ lớn.",
  },
  {
    id: "4",
    name: "iPhone 15 Plus 128GB | Chính hãng VN/A",
    price: 19990000,
    isReleased: true,
    image: ip15_xanhla,
    quantitySold: 600,
    quantity: 350,
    productTypeId: "1",
    brandId: "1",
    discountPercent: 7,
    baseDescription: "Màn hình lớn 6.7 inch, pin siêu bền cho cả ngày.",
  },

  // ===== iPhone 16 series =====
  {
    id: "5",
    name: "iPhone 16 128GB | Chính hãng VN/A",
    price: 21390000,
    isReleased: true,
    image: ip16_xanhluuly,
    quantitySold: 500,
    quantity: 300,
    productTypeId: "1",
    brandId: "1",
    discountPercent: 10,
    baseDescription: "Flagship mới nhất với chip A17 Pro, camera siêu sắc nét.",
  },
  {
    id: "6",
    name: "iPhone 16 256GB | Chính hãng VN/A",
    price: 23390000,
    isReleased: true,
    image: ip16_trang,
    quantitySold: 450,
    quantity: 250,
    productTypeId: "1",
    brandId: "1",
    discountPercent: 10,
    baseDescription: "Màu trắng thanh lịch, hiệu năng tối ưu cho mọi tác vụ.",
  },
  {
    id: "7",
    name: "iPhone 16 512GB | Chính hãng VN/A",
    price: 26990000,
    isReleased: true,
    image: ip16_den,
    quantitySold: 300,
    quantity: 200,
    productTypeId: "1",
    brandId: "1",
    discountPercent: 12,
    baseDescription: "Dung lượng cực lớn, trải nghiệm hoàn hảo.",
  },
  {
    id: "8",
    name: "iPhone 16 Pro 256GB | Chính hãng VN/A",
    price: 29990000,
    isReleased: true,
    image: ip16_hong,
    quantitySold: 350,
    quantity: 180,
    productTypeId: "1",
    brandId: "1",
    discountPercent: 10,
    baseDescription: "Phiên bản Pro với camera Telephoto và khung thép bền bỉ.",
  },

  // ===== iPhone 17 series =====
  {
    id: "9",
    name: "iPhone 17 Pro Max 256GB",
    price: 37990000,
    isReleased: false,
    image: ip17promax_camvutru,
    quantitySold: 200,
    quantity: 50,
    productTypeId: "1",
    brandId: "1",
    discountPercent: 15,
    baseDescription: "Siêu phẩm Apple cao cấp nhất, camera 5 ống kính.",
  },
  {
    id: "10",
    name: "iPhone 17 Pro Max 512GB",
    price: 41990000,
    isReleased: false,
    image: ip17promax_bac,
    quantitySold: 100,
    quantity: 40,
    productTypeId: "1",
    brandId: "1",
    discountPercent: 10,
    baseDescription: "Mẫu Pro Max mới nhất, sang trọng và mạnh mẽ.",
  },
  {
    id: "11",
    name: "iPhone 17 Pro 256GB | Chính hãng VN/A",
    price: 34990000,
    isReleased: false,
    image: ip17promax_xanhdam,
    quantitySold: 180,
    quantity: 60,
    productTypeId: "1",
    brandId: "1",
    discountPercent: 12,
    baseDescription: "Hiệu năng tối thượng với chip A18 và khung titan.",
  },
  {
    id: "12",
    name: "iPhone 17 128GB | Chính hãng VN/A",
    price: 29990000,
    isReleased: false,
    image: ip16_xanhmongket,
    quantitySold: 250,
    quantity: 100,
    productTypeId: "1",
    brandId: "1",
    discountPercent: 8,
    baseDescription: "Thiết kế mới tinh tế, công nghệ sạc không dây nhanh hơn.",
  },
];

export const detailProductData: DetailProduct[] = [
  // ==== iPhone 15 Series ====
  {
    id: "1",
    name: "iPhone 15 128GB | Chính hãng VN/A",
    price: 17390000,
    discountPercent: 10,
    isReleased: true,
    quantitySold: 1000,
    quantity: 500,
    detailDescription:
      "iPhone 15 với chip A16 Bionic mạnh mẽ, camera 48MP sắc nét và thiết kế Dynamic Island hiện đại.",
    highlights: [
      "Chip A16 Bionic hiệu năng vượt trội",
      "Camera chính 48MP chụp ảnh chuyên nghiệp",
      "Thiết kế Dynamic Island tinh tế",
      "Sạc USB-C thế hệ mới",
    ],
    specifications: [
      { label: "Màn hình", value: "Super Retina XDR 6.1 inch" },
      { label: "Chip", value: "Apple A16 Bionic" },
      { label: "Camera", value: "48MP + 12MP" },
      { label: "Pin", value: "3.349 mAh, sạc nhanh 20W" },
      { label: "Dung lượng", value: "128GB" },
    ],
    images: [ip15_xanhduong, ip15_den, ip15_hong, ip15_xanhla],
    colors: ["Xanh dương", "Đen", "Hồng", "Xanh lá"],
    brandName: "Apple",
    productTypeName: "iPhone",
  },
  {
    id: "2",
    name: "iPhone 15 256GB | Chính hãng VN/A",
    price: 19390000,
    discountPercent: 8,
    isReleased: true,
    quantitySold: 700,
    quantity: 400,
    detailDescription:
      "Bản nâng cấp dung lượng 256GB giúp bạn thoải mái lưu trữ mọi khoảnh khắc với hiệu năng A16 Bionic đỉnh cao.",
    highlights: [
      "Dung lượng 256GB rộng rãi",
      "Màn hình OLED sắc nét, mượt mà",
      "Dynamic Island hiển thị thông minh",
      "Cảm giác cầm nắm nhẹ, sang trọng",
    ],
    specifications: [
      { label: "Màn hình", value: "OLED 6.1 inch" },
      { label: "Chip", value: "Apple A16 Bionic" },
      { label: "Camera", value: "48MP + 12MP" },
      { label: "Dung lượng", value: "256GB" },
      { label: "Sạc", value: "USB-C, 20W" },
    ],
    images: [ip15_den, ip15_xanhduong, ip15_xanhla],
    colors: ["Đen", "Xanh dương", "Xanh lá"],
    brandName: "Apple",
    productTypeName: "iPhone",
  },
  {
    id: "3",
    name: "iPhone 15 512GB | Chính hãng VN/A",
    price: 22990000,
    discountPercent: 5,
    isReleased: true,
    quantitySold: 500,
    quantity: 300,
    detailDescription:
      "Phiên bản 512GB mang đến trải nghiệm cao cấp, không lo hết dung lượng khi lưu trữ video 4K và ảnh RAW.",
    highlights: [
      "Dung lượng lưu trữ cực lớn 512GB",
      "Camera 48MP, hỗ trợ quay phim 4K",
      "Pin trâu hơn 20% so với iPhone 14",
      "Thiết kế nhôm bền bỉ, tinh tế",
    ],
    specifications: [
      { label: "Màn hình", value: "6.1 inch OLED Super Retina" },
      { label: "Chip", value: "A16 Bionic" },
      { label: "Camera", value: "48MP + 12MP" },
      { label: "Dung lượng", value: "512GB" },
      { label: "Pin", value: "3.349 mAh" },
    ],
    images: [ip15_hong, ip15_xanhduong, ip15_den],
    colors: ["Hồng", "Xanh dương", "Đen"],
    brandName: "Apple",
    productTypeName: "iPhone",
  },
  {
    id: "4",
    name: "iPhone 15 Plus 128GB | Chính hãng VN/A",
    price: 19990000,
    discountPercent: 7,
    isReleased: true,
    quantitySold: 600,
    quantity: 350,
    detailDescription:
      "iPhone 15 Plus sở hữu màn hình 6.7 inch siêu lớn, pin bền bỉ cùng chip A16 mạnh mẽ.",
    highlights: [
      "Màn hình lớn 6.7 inch, hiển thị rõ ràng",
      "Chip A16 Bionic cực mạnh",
      "Camera 48MP sắc nét",
      "Pin dùng cả ngày dài",
    ],
    specifications: [
      { label: "Màn hình", value: "6.7 inch Super Retina XDR" },
      { label: "Chip", value: "Apple A16 Bionic" },
      { label: "Camera", value: "48MP + 12MP" },
      { label: "Pin", value: "4.383 mAh" },
      { label: "Dung lượng", value: "128GB" },
    ],
    images: [ip15_xanhla, ip15_xanhduong, ip15_den],
    colors: ["Xanh lá", "Xanh dương", "Đen"],
    brandName: "Apple",
    productTypeName: "iPhone",
  },

  // ==== iPhone 16 Series ====
  {
    id: "5",
    name: "iPhone 16 128GB | Chính hãng VN/A",
    price: 21390000,
    discountPercent: 10,
    isReleased: true,
    quantitySold: 500,
    quantity: 300,
    detailDescription:
      "iPhone 16 trang bị chip A17 Pro, hiệu năng vượt trội và camera Telephoto ấn tượng.",
    highlights: [
      "Chip A17 Pro cực mạnh",
      "Camera Ultra Wide góc rộng",
      "Thiết kế khung nhôm nguyên khối",
      "Màn hình ProMotion 120Hz mượt mà",
    ],
    specifications: [
      { label: "Màn hình", value: "6.1 inch ProMotion OLED" },
      { label: "Chip", value: "A17 Pro" },
      { label: "Camera", value: "48MP + 12MP" },
      { label: "Dung lượng", value: "128GB" },
      { label: "Sạc", value: "USB-C 30W" },
    ],
    images: [ip16_xanhluuly, ip16_den, ip16_hong],
    colors: ["Xanh lưu ly", "Đen", "Hồng"],
    brandName: "Apple",
    productTypeName: "iPhone",
  },
  {
    id: "6",
    name: "iPhone 16 256GB | Chính hãng VN/A",
    price: 23390000,
    discountPercent: 10,
    isReleased: true,
    quantitySold: 450,
    quantity: 250,
    detailDescription:
      "iPhone 16 bản 256GB cho phép bạn lưu trữ thoải mái và trải nghiệm mượt mà với chip A17 Pro.",
    highlights: [
      "Bộ nhớ 256GB thoải mái lưu trữ",
      "Màn hình OLED sắc nét",
      "Chip A17 Pro tiên tiến",
      "Camera chính 48MP",
    ],
    specifications: [
      { label: "Màn hình", value: "6.1 inch Super Retina XDR" },
      { label: "Chip", value: "A17 Pro" },
      { label: "Camera", value: "48MP + 12MP" },
      { label: "Dung lượng", value: "256GB" },
      { label: "Pin", value: "3.500 mAh" },
    ],
    images: [ip16_trang, ip16_xanhluuly, ip16_den],
    colors: ["Trắng", "Xanh lưu ly", "Đen"],
    brandName: "Apple",
    productTypeName: "iPhone",
  },
  {
    id: "7",
    name: "iPhone 16 512GB | Chính hãng VN/A",
    price: 26990000,
    discountPercent: 12,
    isReleased: true,
    quantitySold: 300,
    quantity: 200,
    detailDescription:
      "Phiên bản cao cấp với bộ nhớ 512GB, chip A17 Pro, camera nâng cấp mạnh mẽ.",
    highlights: [
      "Dung lượng 512GB cực lớn",
      "Chip A17 Pro mạnh mẽ",
      "Camera Telephoto zoom quang học",
      "Hỗ trợ quay video 4K HDR",
    ],
    specifications: [
      { label: "Màn hình", value: "OLED 6.1 inch" },
      { label: "Chip", value: "A17 Pro" },
      { label: "Camera", value: "48MP + 12MP Tele" },
      { label: "Dung lượng", value: "512GB" },
      { label: "Pin", value: "3.500 mAh" },
    ],
    images: [ip16_den, ip16_trang, ip16_hong],
    colors: ["Đen", "Trắng", "Hồng"],
    brandName: "Apple",
    productTypeName: "iPhone",
  },
  {
    id: "8",
    name: "iPhone 16 Pro 256GB | Chính hãng VN/A",
    price: 29990000,
    discountPercent: 10,
    isReleased: true,
    quantitySold: 350,
    quantity: 180,
    detailDescription:
      "iPhone 16 Pro với khung thép không gỉ, camera Tele 3x và hiệu năng đột phá.",
    highlights: [
      "Khung thép không gỉ cao cấp",
      "Chip A17 Pro, GPU 6 nhân",
      "Camera Tele 3x zoom quang học",
      "Màn hình ProMotion 120Hz",
    ],
    specifications: [
      { label: "Màn hình", value: "6.1 inch LTPO OLED" },
      { label: "Chip", value: "A17 Pro" },
      { label: "Camera", value: "48MP + 12MP Tele" },
      { label: "Dung lượng", value: "256GB" },
      { label: "Chất liệu", value: "Thép không gỉ" },
    ],
    images: [ip16_hong, ip16_trang, ip16_xanhluuly],
    colors: ["Hồng", "Trắng", "Xanh lưu ly"],
    brandName: "Apple",
    productTypeName: "iPhone",
  },

  // ==== iPhone 17 Series ====
  {
    id: "9",
    name: "iPhone 17 Pro Max 256GB",
    price: 37990000,
    discountPercent: 15,
    isReleased: false,
    quantitySold: 200,
    quantity: 50,
    detailDescription:
      "Siêu phẩm iPhone 17 Pro Max với chip A18, camera 5 ống kính và công nghệ AI hỗ trợ hình ảnh.",
    highlights: [
      "Chip A18 thế hệ mới",
      "Camera 5 ống kính đột phá",
      "Khung Titan siêu nhẹ",
      "Màn hình 120Hz siêu sáng",
    ],
    specifications: [
      { label: "Màn hình", value: "6.7 inch OLED ProMotion" },
      { label: "Chip", value: "A18 Bionic" },
      { label: "Camera", value: "5 ống kính AI" },
      { label: "Dung lượng", value: "256GB" },
      { label: "Sạc", value: "USB-C, 35W" },
    ],
    images: [ip17promax_camvutru, ip17promax_bac, ip17promax_xanhdam],
    colors: ["Cam vũ trụ", "Bạc", "Xanh đậm"],
    brandName: "Apple",
    productTypeName: "iPhone",
  },
  {
    id: "10",
    name: "iPhone 17 Pro Max 512GB",
    price: 41990000,
    discountPercent: 10,
    isReleased: false,
    quantitySold: 100,
    quantity: 40,
    detailDescription:
      "Phiên bản cao cấp nhất của Apple năm 2025 – iPhone 17 Pro Max 512GB.",
    highlights: [
      "Dung lượng 512GB khổng lồ",
      "Khung titan siêu bền",
      "Camera Tele 5x",
      "Màn hình ProMotion sáng rực rỡ",
    ],
    specifications: [
      { label: "Màn hình", value: "6.7 inch OLED LTPO" },
      { label: "Chip", value: "A18 Bionic" },
      { label: "Camera", value: "48MP + 12MP + 12MP Tele" },
      { label: "Dung lượng", value: "512GB" },
      { label: "Sạc", value: "USB-C 35W" },
    ],
    images: [ip17promax_bac, ip17promax_camvutru, ip17promax_xanhdam],
    colors: ["Bạc", "Cam vũ trụ", "Xanh đậm"],
    brandName: "Apple",
    productTypeName: "iPhone",
  },
  {
    id: "11",
    name: "iPhone 17 Pro 256GB | Chính hãng VN/A",
    price: 34990000,
    discountPercent: 12,
    isReleased: false,
    quantitySold: 180,
    quantity: 60,
    detailDescription:
      "iPhone 17 Pro được trang bị chip A18 và camera cải tiến mạnh mẽ, hiệu năng vượt trội.",
    highlights: [
      "Chip A18 hiệu năng cực cao",
      "Camera nâng cấp thuật toán AI",
      "Màn hình 120Hz ProMotion",
      "Khung titan cao cấp",
    ],
    specifications: [
      { label: "Màn hình", value: "6.1 inch OLED" },
      { label: "Chip", value: "A18 Bionic" },
      { label: "Camera", value: "48MP + 12MP Tele" },
      { label: "Dung lượng", value: "256GB" },
      { label: "Chất liệu", value: "Titan cao cấp" },
    ],
    images: [ip17promax_xanhdam, ip17promax_bac, ip17promax_camvutru],
    colors: ["Xanh đậm", "Bạc", "Cam vũ trụ"],
    brandName: "Apple",
    productTypeName: "iPhone",
  },
  {
    id: "12",
    name: "iPhone 17 128GB | Chính hãng VN/A",
    price: 29990000,
    discountPercent: 8,
    isReleased: false,
    quantitySold: 250,
    quantity: 100,
    detailDescription:
      "iPhone 17 mở ra kỷ nguyên mới với thiết kế mỏng hơn và khả năng sạc không dây nhanh hơn.",
    highlights: [
      "Thiết kế mới tinh tế, viền mỏng hơn",
      "Sạc không dây nhanh hơn 50%",
      "Camera sắc nét trong mọi điều kiện",
      "Hiệu năng vượt trội với chip A18",
    ],
    specifications: [
      { label: "Màn hình", value: "6.1 inch OLED" },
      { label: "Chip", value: "A18 Bionic" },
      { label: "Camera", value: "48MP + 12MP" },
      { label: "Dung lượng", value: "128GB" },
      { label: "Pin", value: "3.700 mAh" },
    ],
    images: [ip16_xanhmongket, ip16_trang, ip17promax_bac],
    colors: ["Xanh mòng két", "Trắng", "Bạc"],
    brandName: "Apple",
    productTypeName: "iPhone",
  },
];

export const brands: Brand[] = [
  {
    brandId: 1,
    name: "Apple",
    description: "Thương hiệu công nghệ hàng đầu thế giới",
  },
];

export const suppliers: Supplier[] = [
  {
    supplierId: 1,
    name: "Apple Vietnam",
    description: "Nhà cung cấp chính thức của Apple",
  },
];

export const goodsReceipts: GoodsReceipt[] = [
  {
    grId: 1,
    importTime: "2025-10-25",
    employeeRecord: "Nguyễn Văn A",
    supplierId: 1,
  },
];

export const goodsReceiptDetails: GoodsReceiptDetail[] = [
  { grId: 1, id: 1, amount: 50, price: 15000000 },
  { grId: 1, id: 2, amount: 30, price: 18000000 },
];

export const users: User[] = [
  {
    id: 1,
    userName: "Admin",
    email: "admin@example.com",
    password: "123456",
    role: "admin",
  },
  {
    id: 2,
    userName: "Trần Hiền",
    email: "hien@example.com",
    password: "123456",
    role: "customer",
    defaultAddress: "Tokyo, Japan",
  },
];

export const orders: Order[] = [
  {
    orderId: 1,
    userId: 2,
    time: "2025-10-27",
    paymentMethod: "Thẻ tín dụng",
    status: "completed",
    shipAddress: "Tokyo, Japan",
    contactPhoneNumber: "0123456789",
    totalprice: 17390000,
  },
];

export const orderDetails: OrderDetail[] = [
  { orderId: 1, id: 1, amount: 1, price: 17390000 },
];

// fe-client/src/data.ts

// ... (Giữ nguyên toàn bộ code cũ của bạn ở trên) ...

/* -------------------------- CÁC KIỂU DỮ LIỆU ĐỘNG ------------------------- */

// Kiểu cho một "phiên bản" (variant) của sản phẩm
export interface ProductVariant {
  id: string;
  name: string; // Ví dụ: "Đen, 128GB"
  price: number;
  quantity: number;
  image: string; // URL ảnh của phiên bản này
}

// Kiểu "Product" (Sản phẩm) mà API thật trả về
export interface Product {
  id: string;
  name: string;
  description: string;
  brand: { id: string; name: string };
  productType: { id: string; name: string };
  isPublished: boolean;
  // Quan trọng: Dữ liệu động có một mảng variants
  variants: ProductVariant[];
  // Dữ liệu tĩnh có discountPercent ở gốc, ta tạm giữ nó
  discountPercent?: number;
}

/* -------------------------- CART DATA -------------------------- */
export interface CartItem {
  id: string; // id sản phẩm
  name: string; // tên
  price: number; // giá gốc
  image: string; // ảnh
  discountPercent?: number; // giảm giá
  quantity: number; // số lượng người dùng chọn
  maxQuantity: number; // số lượng tồn kho
}

export const cartData: CartItem[] = [
  {
    id: "1",
    name: "iPhone 15 128GB | Chính hãng VN/A",
    price: 17390000,
    image: ip15_den,
    discountPercent: 10,
    quantity: 1,
    maxQuantity: 5,
  },
  {
    id: "5",
    name: "iPhone 16 128GB | Chính hãng VN/A",
    price: 21390000,
    image: ip16_den,
    discountPercent: 10,
    quantity: 2,
    maxQuantity: 10,
  },
];
/* -------------------------- CHECKOUT DATA -------------------------- */
export interface CheckoutProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
}

export interface CheckoutUser {
  fullName: string;
  membership?: string; // ví dụ: S-NULL, S-MEMBER
  email: string;
  phone: string;
  receivePromotion?: boolean;
}

export interface CheckoutInfo {
  id: number;
  user: CheckoutUser;
  products: CheckoutProduct[];
  deliveryMethod: "store" | "delivery";
  city: string;
  district: string;
  storeAddress?: string;
  note?: string;
  needCompanyInvoice: boolean;
  subtotal: number;
}

/* -------------------------- DỮ LIỆU CHECKOUT MẪU -------------------------- */
export const checkoutData: CheckoutInfo = {
  id: 1,
  user: {
    fullName: "Nguyễn Thành Đức",
    membership: "S-NULL",
    email: "wtf5213@gmail.com",
    phone: "0923219754",
    receivePromotion: false,
  },
  products: [
    {
      id: "macbook14m4",
      name: "MacBook Pro 14 M4 Pro 12CPU 16GPU 24GB 512GB | Chính hãng Apple Việt Nam - Đen",
      image: ip16_den, // dùng tạm ảnh có sẵn
      price: 49290000,
      originalPrice: 51990000,
      quantity: 1,
    },
  ],
  deliveryMethod: "store",
  city: "Hồ Chí Minh",
  district: "Quận 1",
  storeAddress: "CellphoneS - 55 Trần Quang Khải, Q.1, TP.HCM",
  note: "",
  needCompanyInvoice: false,
  subtotal: 49290000,
};

