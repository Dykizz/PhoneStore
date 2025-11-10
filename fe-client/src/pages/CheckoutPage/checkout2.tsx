"use client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function CheckoutPage2() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8 relative">
        {/* Nút quay lại */}
        <button
          onClick={() => navigate("/checkout-page1")}
          className="absolute top-4 left-4 flex items-center gap-2 text-gray-600 hover:text-red-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        {/* Tiêu đề */}
        <h1 className="text-center text-2xl font-bold text-gray-900 mb-10 mt-2">
          Thanh toán
        </h1>

        {/* Khối thông tin đơn hàng */}
        <div className="border rounded-xl p-6 mb-8">
          <div className="flex justify-between text-gray-700 mb-2">
            <span>Số lượng sản phẩm</span>
            <span className="font-medium">01</span>
          </div>
          <div className="flex justify-between text-gray-700 mb-2">
            <span>Tổng tiền hàng</span>
            <span>51.990.000đ</span>
          </div>
          <div className="flex justify-between text-gray-700 mb-2">
            <span>Phí vận chuyển</span>
            <span>Miễn phí</span>
          </div>
          <div className="flex justify-between text-gray-700 mb-2">
            <span>Giảm giá trực tiếp</span>
            <span className="text-red-600">-2.200.000đ</span>
          </div>
          <div className="flex justify-between text-gray-700 mb-4">
            <span>
              Giảm giá{" "}
              <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs">
                S-STUDENT
              </span>
            </span>
            <span className="text-red-600">-500.000đ</span>
          </div>
          <div className="border-t pt-3 flex justify-between text-gray-900 font-bold text-lg">
            <span>Tổng tiền</span>
            <span>49.290.000đ</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Đã gồm VAT và được làm tròn số
          </p>
        </div>

        {/* Thông tin thanh toán */}
        <div className="border rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-gray-800 mb-3 text-lg">
            THÔNG TIN THANH TOÁN
          </h2>
          <div className="flex items-center justify-between bg-gray-50 border rounded-lg p-4 hover:bg-gray-100 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <img
                src="https://cdn-icons-png.flaticon.com/512/825/825454.png"
                alt="payment"
                className="w-10 h-10"
              />
              <div>
                <p className="font-medium text-gray-800">
                  Chọn phương thức thanh toán
                </p>
                <p className="text-gray-500 text-sm">Giảm thêm tới 200.000đ</p>
              </div>
            </div>
            <span className="text-red-500 font-semibold text-lg">›</span>
          </div>
        </div>

        {/* Thông tin nhận hàng */}
        <div className="border rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3 text-lg">
            THÔNG TIN NHẬN HÀNG
          </h2>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs mr-1">
                S-STUDENT
              </span>
              Nguyễn Thành Đức
            </p>
            <p>0923219754</p>
            <p>wtf5213@gmail.com</p>
            <p>55B Trần Quang Khải, P. Tân Định, Q. 1, TP. HCM</p>
          </div>
        </div>

        {/* Đồng ý điều khoản */}
        <div className="flex items-start gap-3 mb-6">
          <Checkbox id="terms" />
          <Label htmlFor="terms" className="text-sm text-gray-600 leading-snug">
            Bằng việc đặt hàng, bạn đồng ý với{" "}
            <span className="text-red-600 hover:underline cursor-pointer">
              Điều khoản sử dụng
            </span>{" "}
            của PhoneStore.
          </Label>
        </div>

        {/* Tổng tiền + Nút thanh toán */}
        <div className="bg-gray-50 border-t pt-4 flex justify-between items-center">
          <div>
            <p className="text-gray-600 text-sm">Tổng tiền tạm tính:</p>
            <p className="text-red-600 font-bold text-2xl">49.290.000đ</p>
          </div>
          <Button
            onClick={() => alert("Thanh toán thành công!")}
            className="bg-red-600 hover:bg-red-700 text-white text-lg px-10 py-6 rounded-xl shadow-md transition"
          >
            Thanh toán
          </Button>
        </div>
      </div>
    </div>
  );
}
