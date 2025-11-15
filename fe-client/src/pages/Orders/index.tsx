"use client";
import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  CreditCard,
  Truck,
  Clock,
  CheckCircle,
  Ban,
  SlidersHorizontal,
} from "lucide-react";
import { OrderStatus, PaymentMethod, type BaseOrder } from "@/types/order.type";
import { getMyOrders } from "@/apis/order.api";
import type { MetaPagination } from "@/interfaces/pagination.interface";
import { QueryBuilder } from "@/utils/queryBuilder";
import { showToast } from "@/utils/toast";
import { formatCurrencyVND } from "@/utils/util";
import { Input } from "@/components/ui/input";

const defaultFilter = {
  statusFilter: "all",
  paymentFilter: "all",
  searchText: "",
  sortBy: "",
  sortOrder: "DESC" as "ASC" | "DESC",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<BaseOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>(
    defaultFilter.statusFilter
  );
  const [paymentFilter, setPaymentFilter] = useState<string>(
    defaultFilter.paymentFilter
  );
  const [searchText, setSearchText] = useState<string>(
    defaultFilter.searchText
  );
  const [sortBy, setSortBy] = useState<string>(defaultFilter.sortBy);
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">(
    defaultFilter.sortOrder
  );
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<MetaPagination>({
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const statusOptions = ["all", ...Object.values(OrderStatus)];
  const statusLabels: Record<string, string> = {
    all: "Tất cả",
    new: "Mới",
    processing: "Đang xử lý",
    shipped: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã huỷ",
  };

  const paymentOptions = [
    { value: "all", label: "Tất cả" },
    { value: PaymentMethod.BANK_TRANSFER, label: "Chuyển khoản" },
    { value: PaymentMethod.CASH_ON_DELIVERY, label: "COD" },
  ];

  const sortMoneyOptions = [
    { value: "default", label: "Mặc định" },
    { value: "totalAmount-ASC", label: "Tăng dần" },
    { value: "totalAmount-DESC", label: "Giảm dần" },
  ];

  const sortDateOptions = [
    { value: "default", label: "Mặc định" },
    { value: "createdAt-DESC", label: "Mới nhất" },
    { value: "createdAt-ASC", label: "Cũ nhất" },
  ];

  const fetchMyOrders = async (page = 1) => {
    setLoading(true);
    try {
      const query = QueryBuilder.create()
        .page(page)
        .limit(pagination.limit)
        .search(searchText)
        .sortBy(sortBy, sortOrder)
        .filter("status", statusFilter !== "all" ? statusFilter : undefined)
        .filter(
          "paymentMethod",
          paymentFilter !== "all" ? paymentFilter : undefined
        )
        .build();

      const response = await getMyOrders(query);

      if (response.success) {
        setOrders(response.data.data);
        setPagination(response.data.meta);
      } else {
        showToast({
          type: "error",
          description: "Không thể tải danh sách đơn hàng",
          title: "Lỗi",
        });
      }
    } catch (error) {
      showToast({
        type: "error",
        description: "Không thể tải danh sách đơn hàng",
        title: "Lỗi",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Trigger fetch khi filter thay đổi (giống ProductFilter)
  useEffect(() => {
    fetchMyOrders(1);
  }, [statusFilter, paymentFilter, sortBy, sortOrder, searchText]);

  useEffect(() => {
    fetchMyOrders(pagination.page);
  }, [pagination.page]);

  // ✅ Hàm đặt lại filter (giống ProductFilter)
  const handleDefaultFilter = () => {
    setStatusFilter(defaultFilter.statusFilter);
    setPaymentFilter(defaultFilter.paymentFilter);
    setSearchText(defaultFilter.searchText);
    setSortBy(defaultFilter.sortBy);
    setSortOrder(defaultFilter.sortOrder);
  };

  // 🎨 Badge trạng thái
  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.NEW:
        return {
          label: statusLabels[OrderStatus.NEW],
          color: "bg-gray-200 text-gray-700",
          icon: Clock,
        };
      case OrderStatus.PROCESSING:
        return {
          label: statusLabels[OrderStatus.PROCESSING],
          color: "bg-yellow-100 text-yellow-800",
          icon: Clock,
        };
      case OrderStatus.SHIPPED:
        return {
          label: statusLabels[OrderStatus.SHIPPED],
          color: "bg-blue-100 text-blue-700",
          icon: Truck,
        };
      case OrderStatus.DELIVERED:
        return {
          label: statusLabels[OrderStatus.DELIVERED],
          color: "bg-green-100 text-green-700",
          icon: CheckCircle,
        };
      case OrderStatus.CANCELLED:
        return {
          label: statusLabels[OrderStatus.CANCELLED],
          color: "bg-red-100 text-red-700",
          icon: Ban,
        };
      default:
        return { label: "", color: "", icon: Clock };
    }
  };

  const handleSort = (field: string, orderBy: "ASC" | "DESC") => {
    setSortBy(field);
    setSortOrder(orderBy);
  };

  const getPaymentLabel = (method: PaymentMethod) =>
    method === PaymentMethod.CASH_ON_DELIVERY ? "COD" : "Chuyển khoản";

  const handleCancel = (id: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: OrderStatus.CANCELLED } : o
      )
    );
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-semibold text-gray-900">
          Danh sách đơn hàng
        </h1>

        {/* Bộ lọc */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 mb-6 items-center justify-between gap-4 w-full">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-black" />
              <h2 className="font-semibold text-gray-900 text-lg">
                Bộ lọc đơn hàng
              </h2>
            </div>
            <Button
              onClick={handleDefaultFilter}
              variant="outline"
              className="text-sm font-medium rounded-full border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-black transition-all"
            >
              Đặt lại
            </Button>
          </div>

          {/* Search */}
          <Input
            type="text"
            placeholder="Tìm kiếm đơn hàng theo tên người nhận hoặc số điện thoại..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 px-3 mt-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="w-full flex flex-wrap items-center gap-3 mt-2">
            {/* Lọc trạng thái */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] rounded-full text-sm border-gray-300 flex items-center justify-between hover:bg-gray-100 text-gray-800">
                {statusFilter === "all"
                  ? "Trạng thái"
                  : statusLabels[statusFilter] || statusFilter}
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusLabels[status] || status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Lọc hình thức thanh toán */}
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[200px] rounded-full text-sm border-gray-300 flex items-center justify-between hover:bg-gray-100 text-gray-800">
                {paymentFilter === "all"
                  ? "Hình thức thanh toán"
                  : paymentOptions.find((p) => p.value === paymentFilter)
                      ?.label}
              </SelectTrigger>
              <SelectContent>
                {paymentOptions.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sắp xếp tiền */}
            <Select
              value={
                sortBy === "totalAmount"
                  ? `totalAmount-${sortOrder}`
                  : "default"
              }
              onValueChange={(value) => {
                if (value === "default") {
                  handleSort("", "ASC");
                } else {
                  const [field, order] = value.split("-");
                  handleSort(field, order as "ASC" | "DESC");
                }
              }}
            >
              <SelectTrigger className="w-[180px] rounded-full text-sm border-gray-300 flex items-center justify-between hover:bg-gray-100 text-gray-800">
                {sortBy === "totalAmount"
                  ? `Giá ${sortOrder === "ASC" ? "tăng dần" : "giảm dần"}`
                  : "Sắp xếp theo tiền"}
              </SelectTrigger>
              <SelectContent>
                {sortMoneyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sắp xếp ngày */}
            <Select
              value={
                sortBy === "createdAt" ? `createdAt-${sortOrder}` : "default"
              }
              onValueChange={(value) => {
                if (value === "default") {
                  handleSort("", "ASC");
                } else {
                  const [field, order] = value.split("-");
                  handleSort(field, order as "ASC" | "DESC");
                }
              }}
            >
              <SelectTrigger className="w-[180px] rounded-full text-sm border-gray-300 flex items-center justify-between hover:bg-gray-100 text-gray-800">
                {sortBy === "createdAt"
                  ? `${sortOrder === "DESC" ? "Mới nhất" : "Cũ nhất"}`
                  : "Sắp xếp theo ngày"}
              </SelectTrigger>
              <SelectContent>
                {sortDateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Bảng */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1.2fr,1.8fr,1.2fr,1.3fr,2fr,1.2fr,1.4fr] gap-x-6 bg-gray-50 text-gray-700 font-semibold text-sm py-4 px-8 border-b">
          <div>STT</div>
          <div>Người nhận</div>
          <div>Trạng thái</div>
          <div>Thanh toán</div>
          <div>Tổng tiền</div>
          <div>Ngày đặt</div>
          <div className="text-right">Thao tác</div>
        </div>

        {/* Dòng dữ liệu */}
        {orders.map((order, index) => {
          const s = getStatusStyle(order.status);
          const Icon = s.icon;
          return (
            <div
              key={order.id}
              className="grid grid-cols-[1.2fr,1.8fr,1.2fr,1.3fr,2fr,1.2fr,1.4fr] gap-x-6 items-center px-8 py-5 border-b transition-all duration-300 hover:bg-blue-50/40"
            >
              <div className="font-medium text-gray-900 whitespace-nowrap">
                #{index + 1}
              </div>

              <div className="font-medium text-gray-900">
                {order.recipientName}
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
                {formatCurrencyVND(order.totalAmount)}
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
                        onClick={() => {}}
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
