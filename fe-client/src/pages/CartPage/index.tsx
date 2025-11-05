"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Dùng cho React Router
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Minus, Plus, ArrowLeft } from "lucide-react";
import { cartData, type CartItem } from "@/data";

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

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(cartData);
  const [selectedItems, setSelectedItems] = useState<string[]>(
    cartData.map((p) => p.id)
  );

  const navigate = useNavigate(); // ✅ Dùng để quay lại trang chủ

  // ✅ Tính tổng tiền
  const total = cartItems
    .filter((x) => selectedItems.includes(x.id))
    .reduce((acc, item) => {
      const finalPrice = item.discountPercent
        ? item.price * (1 - item.discountPercent / 100)
        : item.price;
      return acc + finalPrice * item.quantity;
    }, 0);

  // ✅ Chọn / bỏ chọn 1 sản phẩm
  const handleToggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ✅ Chọn / bỏ chọn tất cả
  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(cartItems.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // ✅ Tăng / giảm số lượng
  const handleQuantityChange = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(
                1,
                Math.min(item.maxQuantity, item.quantity + delta)
              ),
            }
          : item
      )
    );
  };

  // ✅ Xóa sản phẩm
  const handleDelete = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItems((prev) => prev.filter((x) => x !== id));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 relative">
      {/* ====== Nút quay lại ====== */}
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 flex items-center gap-1 text-gray-700 hover:text-red-600"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại trang chủ</span>
      </Button>

      <h1 className="text-2xl font-bold mb-4 text-center mt-10">Giỏ hàng của bạn</h1>
      {/* ====== Checkbox chọn tất cả ====== */}
      <div className="flex items-center gap-2 mb-4">
        <Checkbox
          checked={selectedItems.length === cartItems.length && cartItems.length > 0}
          onCheckedChange={(checked) => handleToggleSelectAll(!!checked)}
        />
        <span className="text-gray-700 font-medium">Chọn tất cả</span>
        <span className="text-gray-400 text-sm">
          ({selectedItems.length}/{cartItems.length})
        </span>
      </div>

      {/* ====== Danh sách sản phẩm ====== */}
      <div className="bg-white rounded-xl shadow-sm border divide-y">
        {cartItems.map((item) => {
          const hasDiscount = !!item.discountPercent;
          const finalPrice = hasDiscount
            ? Math.round(item.price * (1 - item.discountPercent / 100))
            : item.price;

          return (
            <div key={item.id} className="p-4 flex gap-4">
              {/* Checkbox giữa dòng */}
              <div className="flex items-center">
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={() => handleToggleSelect(item.id)}
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
                            onClick={() => handleDelete(item.id)}
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
                      {finalPrice.toLocaleString()}đ
                    </span>
                    {hasDiscount && (
                      <span className="text-gray-400 line-through text-sm">
                        {item.price.toLocaleString()}đ
                      </span>
                    )}
                  </div>

                  {/* Số lượng */}
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.id, -1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="font-semibold w-6 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.id, 1)}
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

      {/* ====== Tổng tiền ====== */}
      <div className="flex justify-between items-center bg-white mt-6 p-4 rounded-xl shadow-sm">
        <div>
          <div className="text-gray-600 text-sm">Tạm tính:</div>
          <div className="text-red-600 font-bold text-2xl">
            {total.toLocaleString()}đ
          </div>
        </div>
        <Button className="bg-red-600 text-white text-lg px-10 py-5 rounded-xl">
          Mua ngay ({selectedItems.length})
        </Button>
      </div>
    </div>
  );
}
