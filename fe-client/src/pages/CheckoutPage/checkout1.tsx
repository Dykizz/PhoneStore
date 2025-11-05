"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { checkoutData } from "@/data";

export default function CheckoutPage1() {
  const navigate = useNavigate();
  const user = checkoutData.user;
  const product = checkoutData.products[0];
  const [deliveryMethod, setDeliveryMethod] = useState(
    checkoutData.deliveryMethod
  );
  const [city, setCity] = useState(checkoutData.city);
  const [district, setDistrict] = useState(checkoutData.district);
  const [ward, setWard] = useState("");
  const [receivePromo, setReceivePromo] = useState(
    user.receivePromotion ?? false
  );
  const [needInvoice, setNeedInvoice] = useState(
    checkoutData.needCompanyInvoice
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      {/* Wrapper */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-10 relative">
        {/* Nút quay lại */}
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại giỏ hàng
        </button>

        {/* Tiêu đề */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-10 tracking-tight">
          Thanh toán & Giao hàng
        </h1>

        {/* Layout */}
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Cột trái */}
          <div className="lg:col-span-2 space-y-8">
            {/* Card sản phẩm */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 flex items-start justify-between gap-4 hover:shadow-[0_4px_25px_rgba(0,0,0,0.06)] transition-all duration-300">
              {/* Cột trái: Ảnh và thông tin */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-24 h-24 object-contain rounded-xl bg-gray-50 p-2 shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-snug mb-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-red-600 font-bold text-lg sm:text-xl whitespace-nowrap">
                      {product.price.toLocaleString()}đ
                    </p>
                    {product.originalPrice && (
                      <p className="text-gray-400 line-through text-sm whitespace-nowrap">
                        {product.originalPrice.toLocaleString()}đ
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Cột phải: Số lượng */}
              <div className="text-right whitespace-nowrap ml-4">
                <p className="text-sm font-semibold text-gray-900">
                  Số lượng:{" "}
                  <span className="font-bold text-gray-800">
                    {product.quantity}
                  </span>
                </p>
              </div>
            </div>

            {/* Card khách hàng */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Thông tin khách hàng
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{user.fullName}</p>
                    {user.membership && (
                      <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md">
                        {user.membership}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-700 text-sm">{user.phone}</span>
                </div>
                <p className="text-sm text-gray-700">{user.email}</p>
                <p className="text-xs text-gray-400 italic">
                  (*) Hóa đơn VAT sẽ được gửi qua email này
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <Checkbox
                    id="promotion"
                    checked={receivePromo}
                    onCheckedChange={(val) => setReceivePromo(!!val)}
                  />
                  <Label htmlFor="promotion" className="text-sm text-gray-700">
                    Nhận email thông báo và ưu đãi từ PhoneStore
                  </Label>
                </div>
              </div>
            </div>

            {/* Card nhận hàng */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Thông tin nhận hàng
              </h2>

              <RadioGroup
                value={deliveryMethod}
                onValueChange={setDeliveryMethod}
                className="flex flex-wrap gap-6 mb-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="store" id="store" />
                  <Label htmlFor="store">Nhận tại cửa hàng</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery">Giao hàng tận nơi</Label>
                </div>
              </RadioGroup>

              {/* Form động */}
              {deliveryMethod === "store" ? (
                <>
                  <Input
                    defaultValue={checkoutData.storeAddress}
                    placeholder="Chọn địa chỉ cửa hàng"
                    className="mb-3 rounded-xl border-gray-200 focus:ring-2 focus:ring-red-500"
                  />
                  <Input
                    placeholder="Ghi chú khác (nếu có)"
                    className="rounded-xl border-gray-200 focus:ring-2 focus:ring-red-500"
                  />
                </>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">
                        Tên người nhận
                      </Label>
                      <Input
                        defaultValue={user.fullName}
                        className="rounded-xl border-gray-200 focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">
                        SĐT người nhận
                      </Label>
                      <Input
                        defaultValue={user.phone}
                        className="rounded-xl border-gray-200 focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">
                        Tỉnh / Thành phố
                      </Label>
                      <Select value={city} onValueChange={setCity}>
                        <SelectTrigger className="rounded-xl border-gray-200 focus:ring-2 focus:ring-red-500">
                          <SelectValue placeholder="Chọn tỉnh/thành phố" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hồ Chí Minh">
                            Hồ Chí Minh
                          </SelectItem>
                          <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">
                        Quận / Huyện
                      </Label>
                      <Select value={district} onValueChange={setDistrict}>
                        <SelectTrigger className="rounded-xl border-gray-200 focus:ring-2 focus:ring-red-500">
                          <SelectValue placeholder="Chọn quận/huyện" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Quận 1</SelectItem>
                          <SelectItem value="3">Quận 3</SelectItem>
                          <SelectItem value="7">Quận 7</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">
                        Phường / Xã
                      </Label>
                      <Select value={ward} onValueChange={setWard}>
                        <SelectTrigger className="rounded-xl border-gray-200 focus:ring-2 focus:ring-red-500">
                          <SelectValue placeholder="Chọn phường/xã" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bến Nghé">Bến Nghé</SelectItem>
                          <SelectItem value="Tân Định">Tân Định</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Input
                    placeholder="Số nhà, tên đường (Vui lòng chọn quận/huyện và phường/xã trước)"
                    className="rounded-xl border-gray-200 focus:ring-2 focus:ring-red-500"
                  />
                  <Input
                    placeholder="Ghi chú khác (nếu có)"
                    className="rounded-xl border-gray-200 focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Cột phải: Tổng đơn */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-6 h-fit sticky top-10">
            <h2 className="text-lg font-bold mb-5 text-gray-900">
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{checkoutData.subtotal.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
            </div>

            <hr className="my-5 border-gray-200" />

            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Tổng cộng</span>
              <span className="text-red-600">
                {checkoutData.subtotal.toLocaleString()}đ
              </span>
            </div>

            <Button
              onClick={() => navigate("/checkout-page2")}
              className="bg-red-600 hover:bg-red-700 text-white text-lg px-10 py-5 rounded-xl"
            >
              Tiếp tục thanh toán
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
