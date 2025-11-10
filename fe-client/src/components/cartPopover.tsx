import { ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/cartContexts";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link, useNavigate } from "react-router-dom";
import { formatCurrencyVND } from "@/utils/util";

export function CartPopover() {
  const {
    cartItems,
    cartCount,
    removeFromCart,
    updateQuantity,
    toggleSelectItemAll,
  } = useCart();
  const navigate = useNavigate();

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.finalPrice * item.quantity,
    0
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ShoppingCart className="h-6 w-6 text-gray-700" />{" "}
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-96 p-0 shadow-lg border rounded-lg"
        align="end"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg text-gray-800">
            Giỏ hàng của bạn
          </h3>
          <span className="text-sm text-gray-500">
            {cartItems.length} loại sản phẩm
          </span>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">Giỏ hàng của bạn đang trống</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {cartItems.map((item) => (
                <div
                  key={item.variantId}
                  className="p-4 flex gap-4 items-start"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-800 truncate mb-1">
                      {item.name}
                    </h4>
                    <div className="flex gap-2">
                      <p className="text-red-600 font-semibold text-sm">
                        {formatCurrencyVND(item.finalPrice)}
                      </p>
                      {item.price != item.finalPrice && (
                        <p className="text-gray-400 text-sm line-through">
                          {formatCurrencyVND(item.price)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity - 1)
                        }
                        className="w-6 h-6 border rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300"
                        aria-label="Giảm số lượng"
                      >
                        -
                      </button>
                      <span className="text-sm w-8 text-center font-medium text-gray-700">
                        {item.quantity}
                      </span>
                      <button
                        disabled={item.quantity >= item.maxQuantity}
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity + 1)
                        }
                        className="w-6 h-6 border rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300"
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.variantId)}
                    className="text-gray-400 hover:text-red-500 p-1 mt-1"
                    aria-label="Xóa sản phẩm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t p-4 space-y-3 bg-gray-50 rounded-b-lg">
            <div className="flex items-center justify-between font-semibold text-gray-800">
              <span>Tổng cộng:</span>
              <span className="text-red-600 text-lg">
                {formatCurrencyVND(totalPrice)}
              </span>
            </div>
            <Link to="/cart" className="block">
              <Button className="w-full" variant="outline">
                Xem chi tiết giỏ hàng
              </Button>
            </Link>

            <Button
              onClick={() => {
                toggleSelectItemAll(true);
                navigate("/checkout");
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Thanh toán ngay
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
