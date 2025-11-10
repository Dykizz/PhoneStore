"use client";

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Minus, Plus, ArrowLeft } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCart } from "@/contexts/cartContexts";
import { formatCurrencyVND } from "@/utils/util";
import { showToast } from "@/utils/toast";

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    toggleSelectItem,
    countSelectedItems,
    toggleSelectItemAll,
    updateQuantity,

    totalPriceSelected,
  } = useCart();

  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto p-6 relative">
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 flex items-center gap-1 text-gray-700 hover:text-red-600"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại trang chủ</span>
      </Button>

      <h1 className="text-2xl font-bold mb-4 text-center mt-10">
        Giỏ hàng của bạn
      </h1>

      <div className="flex items-center gap-2 mb-4">
        <Checkbox
          checked={
            cartItems.every((item) => item.selected) && cartItems.length > 0
          }
          onCheckedChange={(checked) => toggleSelectItemAll(!!checked)}
        />
        <span className="text-gray-700 font-medium">Chọn tất cả</span>
        <span className="text-gray-400 text-sm">
          ({countSelectedItems()}/{cartItems.length})
        </span>
      </div>

      {/* ====== Danh sách sản phẩm ====== */}
      <div className="bg-white rounded-xl shadow-sm border divide-y">
        {cartItems.map((item) => {
          return (
            <div key={item.variantId} className="p-4 flex gap-4">
              <div className="flex items-center">
                <Checkbox
                  checked={item.selected}
                  onCheckedChange={() => toggleSelectItem(item.variantId)}
                />
              </div>

              {/* Thông tin sản phẩm */}
              <div className="flex items-start gap-4 flex-1">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-contain rounded-md"
                />

                <div className="flex-1">
                  <div className="flex justify-between">
                    <h2 className="font-semibold text-gray-800">{item.name}</h2>

                    {/* ⚠️ Nút xóa có cảnh báo */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Xóa sản phẩm khỏi giỏ hàng
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc muốn xóa{" "}
                            <span className="font-semibold text-gray-800">
                              {item.name}
                            </span>{" "}
                            khỏi giỏ hàng không?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => removeFromCart(item.variantId)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-red-600 font-bold text-lg">
                      {formatCurrencyVND(item.finalPrice)}
                    </span>
                    {item.price != item.finalPrice && (
                      <span className="text-gray-400 line-through text-sm">
                        {item.price.toLocaleString()}đ
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity - 1)
                      }
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="font-semibold w-6 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={item.quantity >= item.maxQuantity}
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity + 1)
                      }
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center bg-white mt-6 p-4 rounded-xl shadow-sm">
        <div>
          <div className="text-gray-600 text-sm">Tạm tính:</div>
          <div className="text-red-600 font-bold text-2xl">
            {formatCurrencyVND(totalPriceSelected)}
          </div>
        </div>

        <Button
          onClick={() => {
            if (countSelectedItems() === 0) {
              showToast({
                type: "info",
                description: "Vui lòng chọn ít nhất một sản phẩm để mua hàng.",
                title: "Chưa có sản phẩm nào được chọn",
              });
              return;
            }
            navigate("/checkout");
          }}
          className="bg-red-600 text-white text-lg px-10 py-5 rounded-xl"
        >
          Mua ngay ({countSelectedItems()})
        </Button>
      </div>
    </div>
  );
}
