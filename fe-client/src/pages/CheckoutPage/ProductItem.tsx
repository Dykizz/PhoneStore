import type { CartItem } from "@/contexts/cartContexts";
import { formatCurrencyVND } from "@/utils/util";
import { Link } from "react-router-dom";

const ProductItem = ({ product }: { product: CartItem }) => (
  <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-4 flex items-start justify-between gap-4 hover:shadow-[0_4px_25px_rgba(0,0,0,0.06)] transition-all duration-300">
    <div className="flex items-start gap-4 flex-1 min-w-0">
      <img
        src={product.image}
        alt={product.name}
        className="w-24 h-24 object-contain rounded-xl bg-gray-50 p-2 shrink-0"
      />
      <div className="min-w-0">
        <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-snug mb-1">
          <Link
            className="hover:text-blue-400"
            to={`/products/${product.productId}`}
          >
            {product.name}
          </Link>
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-red-600 font-bold text-lg sm:text-xl whitespace-nowrap">
            {formatCurrencyVND(product.finalPrice)}
          </p>
          {product.price !== product.finalPrice && (
            <p className="text-gray-400 line-through text-sm whitespace-nowrap">
              {formatCurrencyVND(product.price)}
            </p>
          )}
        </div>
      </div>
    </div>
    <div className="text-right whitespace-nowrap ml-4">
      <p className="text-sm font-semibold text-gray-900">
        Số lượng:{" "}
        <span className="font-bold text-gray-800">{product.quantity}</span>
      </p>
    </div>
  </div>
);

export default ProductItem;
