import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BaseProduct } from "@/types/product.type";
import { formatCurrencyVND } from "@/utils/util";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Product({ product }: { product: BaseProduct }) {
  const p = product;
  const discountPercent = p.discount?.discountPercent || 0;
  const finalPrice = discountPercent
    ? Math.round(p.price * (1 - discountPercent / 100))
    : p.price;
  return (
    <motion.div
      key={p.id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="h-full flex flex-col overflow-hidden border border-gray-200 bg-white hover:border-black rounded-2xl
                   shadow-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-300 relative group hover:-translate-y-1"
      >
        {/* ẢNH SẢN PHẨM */}
        <Link to={`/product/${p.id}`}>
          <CardHeader className="p-0 relative flex items-center justify-center bg-white h-64 cursor-pointer">
            <div className="overflow-hidden w-full h-full flex items-center justify-center bg-gray-50">
              <img
                src={p.variants[0].image}
                alt={p.name}
                className="object-contain w-full h-full p-4 transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            {discountPercent != 0 && (
              <span
                className="absolute top-2 left-2 bg-black text-white 
                               text-[11px] px-2 py-1 rounded-md shadow-sm"
              >
                -{discountPercent}%
              </span>
            )}

            {p.quantity - p.quantitySold <= 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center -top-2">
                <span className="text-white text-2xl font-bold transform -rotate-45">
                  Hết hàng
                </span>
              </div>
            )}
          </CardHeader>
        </Link>

        {/* THÔNG TIN SẢN PHẨM */}
        <CardContent className="p-4 flex-1">
          <Link to={`/product/${p.id}`}>
            <CardTitle className="text-md md:text-lg font-semibold mb-2 line-clamp-2 text-gray-900 group-hover:text-black transition-colors">
              {p.name}
            </CardTitle>
          </Link>

          <div className="flex flex-col">
            <span className="text-black font-bold text-lg">
              {formatCurrencyVND(finalPrice)}
            </span>
            {discountPercent != 0 && (
              <span className="text-gray-400 text-sm line-through">
                {formatCurrencyVND(p.price)}
              </span>
            )}

            <div className="flex gap-2">
              <span className="text-gray-600 text-sm ">
                Kho: {p.quantity - p.quantitySold}
              </span>

              <span className="text-gray-600 text-sm ">
                Đã bán: {p.quantitySold}
              </span>
            </div>
          </div>
        </CardContent>

        {/* NÚT XEM CHI TIẾT */}
        <CardFooter className="px-4 pb-4 mt-auto">
          <Link to={`/product/${p.id}`} className="w-full">
            <Button
              className="w-full text-sm py-2 font-medium text-white bg-black hover:bg-gray-900 
                         transition-all duration-300 rounded-full shadow-md hover:shadow-lg"
            >
              Xem chi tiết
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
