"use client";
import { useParams, Link } from "react-router-dom";
import { ordersData, OrderStatus, PaymentStatus } from "@/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Truck, CheckCircle, Ban } from "lucide-react";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const order = ordersData.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-500">
        Không tìm thấy đơn hàng
      </div>
    );
  }

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.NEW:
        return { label: "Mới", color: "bg-gray-200 text-gray-700", icon: Truck };
      case OrderStatus.PROCESSING:
        return { label: "Đang xử lý", color: "bg-yellow-100 text-yellow-800", icon: Truck };
      case OrderStatus.SHIPPED:
        return { label: "Đang giao", color: "bg-blue-100 text-blue-700", icon: Truck };
      case OrderStatus.DELIVERED:
        return { label: "Hoàn tất", color: "bg-green-100 text-green-700", icon: CheckCircle };
      case OrderStatus.CANCELLED:
        return { label: "Đã huỷ", color: "bg-red-100 text-red-700", icon: Ban };
      default:
        return { label: "", color: "", icon: Truck };
    }
  };

  const status = getStatusStyle(order.status);
  const StatusIcon = status.icon;

  return (
    <div className="w-full px-12 py-12 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-semibold text-gray-900">
            Đơn hàng <span className="text-blue-600">#{order.id}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
        <Badge className={`${status.color} flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium`}>
          <StatusIcon size={16} /> {status.label}
        </Badge>
      </div>

      {/* Nội dung */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10">
        {/* Cột trái */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-5 text-gray-900">Thông tin giao hàng</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <p><span className="font-medium text-gray-900">Khách hàng: </span>{order.customer.userName}</p>
            <p>📞 {order.phoneNumber}</p>
            <p>📍 {order.addressShipping}</p>
            {order.note && <p className="italic text-gray-500 text-sm">Ghi chú: “{order.note}”</p>}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-5">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Thanh toán</h3>
            <p className="flex items-center gap-2 text-gray-700 text-sm">
              <CreditCard size={16} className="text-gray-500" />
              {order.paymentMethod === "bank_transfer" ? "Chuyển khoản ngân hàng" : "Thanh toán khi nhận hàng"}
            </p>
            <p className={`text-sm mt-2 ${order.paymentStatus === PaymentStatus.COMPLETED ? "text-green-600 font-medium" : "text-yellow-600"}`}>
              {order.paymentStatus === PaymentStatus.COMPLETED ? "Đã thanh toán" : "Chưa thanh toán"}
            </p>
            <p className="text-blue-600 font-semibold text-base mt-3">
              Tổng tiền: {order.totalAmount.toLocaleString()}₫
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Cập nhật: {new Date(order.updatedAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>

        {/* Cột phải */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-5 text-gray-900">Sản phẩm trong đơn</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-all duration-200"
              >
                <img
                  src={`/${item.image}.webp`}
                  alt={item.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    SL: {item.quantity} × {item.price.toLocaleString()}₫
                  </p>
                  <p className="font-semibold text-blue-600 mt-1">
                    {(item.price * item.quantity).toLocaleString()}₫
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Back button */}
      <div className="mt-10 flex justify-center">
        <Link to="/orders">
          <Button variant="outline" className="flex items-center gap-2 px-6 py-2 border-gray-300 hover:bg-blue-50 transition-all duration-300">
            <ArrowLeft size={16} />
            Quay lại danh sách đơn hàng
          </Button>
        </Link>
      </div>
    </div>
  );
}
