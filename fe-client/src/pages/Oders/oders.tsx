"use client";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ordersData as initialOrders,
  OrderStatus,
  PaymentMethod,
} from "@/data";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  ChevronDown,
  CreditCard,
  Truck,
  Clock,
  CheckCircle,
  Ban,
  ArrowUpDown,
} from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [sortByAmount, setSortByAmount] = useState<"asc" | "desc" | null>(null);
  const [sortByDate, setSortByDate] = useState<"new" | "old" | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // 🎨 Badge trạng thái
  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.NEW:
        return {
          label: "New",
          color: "bg-gray-200 text-gray-700",
          icon: Clock,
        };
      case OrderStatus.PROCESSING:
        return {
          label: "Processing",
          color: "bg-yellow-100 text-yellow-800",
          icon: Clock,
        };
      case OrderStatus.SHIPPED:
        return {
          label: "Shipped",
          color: "bg-blue-100 text-blue-700",
          icon: Truck,
        };
      case OrderStatus.DELIVERED:
        return {
          label: "Delivered",
          color: "bg-green-100 text-green-700",
          icon: CheckCircle,
        };
      case OrderStatus.CANCELLED:
        return {
          label: "Cancelled",
          color: "bg-red-100 text-red-700",
          icon: Ban,
        };
      default:
        return { label: "", color: "", icon: Clock };
    }
  };

  // 💳 Nhãn thanh toán
  const getPaymentLabel = (method: PaymentMethod) =>
    method === PaymentMethod.CASH_ON_DELIVERY
      ? "Thanh toán khi nhận hàng"
      : "Chuyển khoản ngân hàng";

  // 🔎 Lọc + sắp xếp
  const filteredOrders = useMemo(() => {
    let data = [...orders];
    if (statusFilter !== "all")
      data = data.filter((o) => o.status === statusFilter);
    if (paymentFilter !== "all")
      data = data.filter((o) => o.paymentMethod === paymentFilter);
    if (sortByAmount)
      data.sort((a, b) =>
        sortByAmount === "asc"
          ? a.totalAmount - b.totalAmount
          : b.totalAmount - a.totalAmount
      );
    if (sortByDate)
      data.sort((a, b) =>
        sortByDate === "new"
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    return data;
  }, [orders, statusFilter, paymentFilter, sortByAmount, sortByDate]);

  // ❌ Huỷ đơn
  const handleCancel = (id: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: OrderStatus.CANCELLED } : o
      )
    );
    setSelectedOrder(null);
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-semibold text-gray-900">
          Danh sách đơn hàng
        </h1>

        {/* Bộ lọc */}
        <div className="flex flex-wrap gap-3 items-center justify-end">
          {/* Lọc trạng thái */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Trạng thái <ChevronDown size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {[
                "all",
                "new",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
              ].map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`capitalize cursor-pointer ${
                    statusFilter === status ? "bg-blue-50 text-blue-700" : ""
                  }`}
                >
                  {status === "all"
                    ? "Tất cả"
                    : status === "new"
                    ? "Mới"
                    : status === "processing"
                    ? "Đang xử lý"
                    : status === "shipped"
                    ? "Đang giao"
                    : status === "delivered"
                    ? "Hoàn tất"
                    : "Đã huỷ"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Lọc hình thức thanh toán */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Hình thức thanh toán <ChevronDown size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {[
                { value: "all", label: "Tất cả" },
                {
                  value: PaymentMethod.BANK_TRANSFER,
                  label: "Chuyển khoản ngân hàng",
                },
                {
                  value: PaymentMethod.CASH_ON_DELIVERY,
                  label: "Thanh toán khi nhận hàng",
                },
              ].map((method) => (
                <DropdownMenuItem
                  key={method.value}
                  onClick={() => setPaymentFilter(method.value)}
                  className={`cursor-pointer ${
                    paymentFilter === method.value
                      ? "bg-blue-50 text-blue-700"
                      : ""
                  }`}
                >
                  {method.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sắp xếp tiền */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Sắp xếp theo tiền <ArrowUpDown size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setSortByAmount(null)}>
                Mặc định
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortByAmount("asc")}>
                Tăng dần
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortByAmount("desc")}>
                Giảm dần
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sắp xếp ngày */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Sắp xếp theo ngày <ArrowUpDown size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setSortByDate(null)}>
                Mặc định
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortByDate("new")}>
                Mới nhất
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortByDate("old")}>
                Cũ nhất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bảng */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1.2fr,1.8fr,1.2fr,1.3fr,2fr,1.2fr,1.4fr] gap-x-6 bg-gray-50 text-gray-700 font-semibold text-sm py-4 px-8 border-b">
          <div>Mã đơn</div>
          <div>Khách hàng</div>
          <div>Trạng thái</div>
          <div>Thanh toán</div>
          <div>Tổng tiền</div>
          <div>Ngày đặt</div>
          <div className="text-right">Thao tác</div>
        </div>

        {/* Dòng dữ liệu */}
        {filteredOrders.map((order) => {
          const s = getStatusStyle(order.status);
          const Icon = s.icon;
          return (
            <div
              key={order.id}
              className="grid grid-cols-[1.2fr,1.8fr,1.2fr,1.3fr,2fr,1.2fr,1.4fr] gap-x-6 items-center px-8 py-5 border-b transition-all duration-300 hover:bg-blue-50/40"
            >
              <div className="font-medium text-gray-900 whitespace-nowrap">
                #{order.id}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {order.customer.userName}
                </p>
                <p className="text-xs text-gray-500">{order.phoneNumber}</p>
              </div>
              <div>
                <Badge
                  className={`${s.color} flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit`}
                >
                  <Icon size={14} /> {s.label}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-gray-700 text-sm">
                <CreditCard size={15} className="text-gray-500" />
                {getPaymentLabel(order.paymentMethod)}
              </div>
              <div className="font-semibold text-blue-600 text-sm whitespace-nowrap">
                {order.totalAmount.toLocaleString()}₫
              </div>
              <div className="text-gray-700 whitespace-nowrap">
                {new Date(order.createdAt).toLocaleDateString("vi-VN")}
              </div>
              {/* Cột thao tác */}
              <div className="flex justify-end gap-2">
                {order.status === OrderStatus.NEW && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-red-100 hover:bg-red-200 text-red-600 transition-all duration-200"
                        onClick={() => setSelectedOrder(order.id)}
                      >
                        Huỷ
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận huỷ đơn</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn huỷ đơn hàng{" "}
                          <span className="font-semibold text-gray-900">
                            #{order.id}
                          </span>{" "}
                          không? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Huỷ bỏ</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleCancel(order.id)}
                        >
                          Xác nhận
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                <Link to={`/orders/${order.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-sm border-gray-300 hover:bg-blue-100 transition-all duration-300"
                  >
                    Xem
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
