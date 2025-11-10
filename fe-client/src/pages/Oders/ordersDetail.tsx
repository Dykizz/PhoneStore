"use client";
import { Link, useParams } from "react-router-dom";
import {
  ordersData,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from "@/data";
import type { DetailOrder } from "@/data";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  MapPin,
  Phone,
  ArrowLeft,
  CheckCircle,
  Clock,
  Truck,
  Ban,
  Package,
} from "lucide-react";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const order: DetailOrder | undefined = ordersData.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-600">
        <Ban size={48} className="text-red-400 mb-3" />
        <p>Không tìm thấy đơn hàng.</p>
        <Link to="/orders">
          <Button variant="outline" className="mt-4">
            Quay lại danh sách đơn hàng
          </Button>
        </Link>
      </div>
    );
  }

  /* ---------------------------- BADGE TRẠNG THÁI ---------------------------- */
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.NEW:
        return <Badge className="bg-gray-200 text-gray-700">Mới</Badge>;
      case OrderStatus.PROCESSING:
        return <Badge className="bg-yellow-100 text-yellow-700">Đang xử lý</Badge>;
      case OrderStatus.SHIPPED:
        return (
          <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
            <Truck size={14} /> Đang giao
          </Badge>
        );
      case OrderStatus.DELIVERED:
        return (
          <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle size={14} /> Hoàn tất
          </Badge>
        );
      case OrderStatus.CANCELLED:
        return (
          <Badge className="bg-red-100 text-red-700 flex items-center gap-1">
            <Ban size={14} /> Đã huỷ
          </Badge>
        );
    }
  };

  /* -------------------------- TRẠNG THÁI THANH TOÁN -------------------------- */
  const getPaymentStatus = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return <span className="text-green-600 font-medium">Đã thanh toán</span>;
      case PaymentStatus.PENDING:
        return <span className="text-yellow-600 font-medium">Đang chờ xử lý</span>;
      case PaymentStatus.FAILED:
        return <span className="text-red-600 font-medium">Thanh toán thất bại</span>;
    }
  };

  /* ----------------------------- TIẾN TRÌNH GIAO HÀNG ----------------------------- */
  const getTimeline = (status: OrderStatus) => {
    // Trường hợp đơn bị hủy: chỉ hiển thị 1 trạng thái duy nhất
    if (status === OrderStatus.CANCELLED) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <Ban size={40} className="text-red-500 mb-3" />
          <p className="text-red-600 font-semibold text-lg">Đơn hàng đã bị huỷ</p>
        </div>
      );
    }

    const steps = [
      { label: "Mới", icon: Clock, key: OrderStatus.NEW },
      { label: "Đang xử lý", icon: Package, key: OrderStatus.PROCESSING },
      { label: "Đang giao", icon: Truck, key: OrderStatus.SHIPPED },
      { label: "Hoàn tất", icon: CheckCircle, key: OrderStatus.DELIVERED },
    ];

    const activeIndex = steps.findIndex((s) => s.key === status);

    return (
      <div className="relative flex justify-between items-center w-full mt-8 px-2">
        {/* Thanh nền */}
        <div className="absolute top-1/2 left-0 w-full h-[3px] bg-gray-200 -translate-y-1/2 z-0 rounded-full" />
        {/* Thanh tiến trình */}
        <div
          className="absolute top-1/2 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700 ease-in-out z-0 rounded-full"
          style={{
            width: `${(activeIndex / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx <= activeIndex;
          return (
            <div
              key={step.label}
              className="flex flex-col items-center relative z-10 w-1/4 animate-fadeIn"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  isActive
                    ? "border-blue-500 bg-blue-500 text-white shadow-md scale-105"
                    : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                <Icon size={18} />
              </div>
              <p
                className={`mt-2 text-sm ${
                  isActive ? "text-blue-600 font-medium" : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 animate-fadeIn">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* HEADER */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Đơn hàng <span className="text-blue-600">#{order.id}</span>
            </h1>
            <p className="text-gray-500 mt-1">
              Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <div>{getStatusBadge(order.status)}</div>
        </div>

        {/* TIMELINE */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tiến trình giao hàng
          </h2>
          {getTimeline(order.status)}
        </div>

        {/* THÔNG TIN + SẢN PHẨM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Thông tin giao hàng */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Thông tin giao hàng
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <span className="font-medium">Khách hàng:</span>{" "}
                {order.customer.userName}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={16} className="text-gray-500" /> {order.phoneNumber}
              </p>
              <p className="flex items-start gap-2">
                <MapPin size={16} className="text-gray-500 mt-1" />
                {order.addressShipping}
              </p>
              {order.note && (
                <p className="italic text-gray-500 border-l-4 border-gray-200 pl-3">
                  Ghi chú: “{order.note}”
                </p>
              )}
            </div>

            <h2 className="text-lg font-semibold text-gray-900 mt-6 border-b pb-2">
              Thanh toán
            </h2>
            <div className="space-y-3 mt-3">
              <p className="flex items-center gap-2 text-gray-700">
                <CreditCard size={16} className="text-gray-500" />
                {order.paymentMethod === PaymentMethod.CASH_ON_DELIVERY
                  ? "Thanh toán khi nhận hàng"
                  : "Chuyển khoản ngân hàng"}
              </p>
              <p>{getPaymentStatus(order.paymentStatus)}</p>
              <p className="text-blue-600 font-semibold">
                Tổng tiền: {order.totalAmount.toLocaleString()}₫
              </p>
              <p className="text-xs text-gray-400">
                Cập nhật: {new Date(order.updatedAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>

          {/* Sản phẩm */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Sản phẩm trong đơn
            </h2>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 py-4 hover:bg-gray-50 rounded-xl transition"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      SL: {item.quantity} × {item.price.toLocaleString()}₫
                    </p>
                    <p className="text-blue-600 font-semibold mt-1">
                      {(item.price * item.quantity).toLocaleString()}₫
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nút quay lại */}
        <div className="flex justify-center pt-4">
          <Link to="/orders">
            <Button
              variant="outline"
              className="flex items-center gap-2 px-5 py-2 text-gray-700 hover:bg-gray-100 transition-all duration-300 rounded-xl"
            >
              <ArrowLeft size={16} /> Quay lại danh sách đơn hàng
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
