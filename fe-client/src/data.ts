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
  ptId: number;              // khóa chính
  name: string;              // tên loại sản phẩm (ví dụ: iPhone, iPad,...)
  description?: string;
};

/* -------------------------- DiscountPolicy ----------------------- */
export type DiscountPolicy = {
  dpId: number;              // khóa chính
  discountPercent: number;   // phần trăm giảm giá
  startDate: string;         // ngày bắt đầu
  endDate: string;           // ngày kết thúc
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
  importTime: string;         // ngày nhập
  employeeRecord: string;     // nhân viên nhập
  supplierId: number;         // khóa ngoại → Supplier
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
  { dpId: 1, discountPercent: 10, startDate: "2025-10-01", endDate: "2025-11-01" },
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
  {
    id: "1",
    name: "iPhone 15 128GB | Chính hãng VN/A",
    price: 17390000,
    discountPercent: 10,
    isReleased: true,
    quantitySold: 1000,
    quantity: 500,
    detailDescription: "Thiết kế tinh tế, chip A16 Bionic, camera 48MP.",
    images: [ip15_xanhduong, ip15_den, ip15_xanhla, ip15_hong],
    colors: ["Xanh dương", "Đen", "Xanh lá", "Hồng"],
    brandName: "Apple",
    productTypeName: "iPhone",
  },
  {
    id: "2",
    name: "iPhone 16 128GB | Chính hãng VN/A",
    price: 21390000,
    discountPercent: 10,
    isReleased: true,
    quantitySold: 500,
    quantity: 300,
    detailDescription: "Chip A17 Pro, màn hình 120Hz, pin lâu hơn.",
    images: [ip16_xanhluuly, ip16_trang, ip16_hong, ip16_den, ip16_xanhmongket],
    colors: ["Xanh lưu ly", "Trắng", "Hồng", "Đen", "Xanh mòng két"],
    brandName: "Apple",
    productTypeName: "iPhone",
  },
  {
    id: "3",
    name: "iPhone 17 Pro Max 256GB",
    price: 37990000,
    discountPercent: 15,
    isReleased: false,
    quantitySold: 200,
    quantity: 50,
    detailDescription: "Chip A18, camera 5 ống kính, vật liệu Titan.",
    images: [ip17promax_camvutru, ip17promax_bac, ip17promax_xanhdam],
    colors: ["Cam vũ trụ", "Bạc", "Xanh đậm"],
    brandName: "Apple",
    productTypeName: "iPhone",
  },
];

export const brands: Brand[] = [
  { brandId: 1, name: "Apple", description: "Thương hiệu công nghệ hàng đầu thế giới" },
];

export const suppliers: Supplier[] = [
  { supplierId: 1, name: "Apple Vietnam", description: "Nhà cung cấp chính thức của Apple" },
];

export const goodsReceipts: GoodsReceipt[] = [
  { grId: 1, importTime: "2025-10-25", employeeRecord: "Nguyễn Văn A", supplierId: 1 },
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
