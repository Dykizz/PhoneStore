"use client";

import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Home,
  RotateCcw,
  Receipt,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  // Get URL parameters
  const status = searchParams!.get("status");
  const orderId = searchParams!.get("orderId");
  const amount = searchParams!.get("amount");
  const transactionNo = searchParams!.get("transactionNo");
  const code = searchParams!.get("code");
  const message = searchParams!.get("message");

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);

      if (status === "success") {
        toast.success(`Thanh toán thành công! Mã giao dịch: ${transactionNo}`);
      } else if (status === "failed") {
        toast.error(
          `Thanh toán thất bại: ${
            message ? decodeURIComponent(message) : "Không xác định"
          }`
        );
      } else if (status === "error") {
        toast.error("Có lỗi xảy ra trong quá trình xử lý thanh toán");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [status, transactionNo, message]);

  // Format currency
  const formatCurrency = (amount: string | null) => {
    if (!amount) return "0 VND";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(parseInt(amount));
  };

  // Format transaction date
  const getCurrentDate = () => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Loader2 className="h-16 w-16 animate-spin mx-auto text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Đang xử lý kết quả thanh toán...
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Vui lòng đợi trong giây lát
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-5 px-4">
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="size-4" />
        Quay lại
      </Button>

      <div className="min-h-screen dark:bg-gray-900 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          {status === "success" && (
            <div className="space-y-6">
              {/* Success Header */}
              <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">
                      Thanh toán thành công!
                    </h1>
                    <p className="text-green-700 dark:text-green-400">
                      Giao dịch của bạn đã được xử lý thành công
                    </p>
                  </div>

                  <Badge className="bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600">
                    Đã thanh toán
                  </Badge>
                </CardContent>
              </Card>

              {/* Transaction Details */}
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Chi tiết giao dịch
                  </h2>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        Mã đơn hàng:
                      </span>
                      <span className="font-mono font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {orderId}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        Mã giao dịch:
                      </span>
                      <span className="font-mono font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {transactionNo}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        Số tiền:
                      </span>
                      <span className="font-semibold text-lg text-green-600 dark:text-green-400">
                        {formatCurrency(amount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        Thời gian:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {getCurrentDate()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        Phương thức:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          VNPAY
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-row-reverse">
                <Link to={"/"}>
                  <Button className="flex items-center justify-center gap-2 h-12">
                    <Home className="h-4 w-4" />
                    Về trang chủ
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Failed State */}
          {status === "failed" && (
            <div className="space-y-6">
              {/* Error Header */}
              <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-800/30 rounded-full flex items-center justify-center mb-4">
                      <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-red-800 dark:text-red-300 mb-2">
                      Thanh toán thất bại
                    </h1>
                    <p className="text-red-700 dark:text-red-400">
                      Giao dịch của bạn không thể hoàn tất
                    </p>
                  </div>

                  <Badge
                    variant="destructive"
                    className="bg-red-600 dark:bg-red-500 text-white"
                  >
                    Thất bại
                  </Badge>
                </CardContent>
              </Card>

              {/* Error Details */}
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                    Chi tiết lỗi
                  </h2>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        Mã đơn hàng:
                      </span>
                      <span className="font-mono font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {orderId}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        Mã lỗi:
                      </span>
                      <span className="font-mono font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                        {code}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        Lý do:
                      </span>
                      <span className="font-medium text-red-600 dark:text-red-400 text-right max-w-xs">
                        {message
                          ? decodeURIComponent(message)
                          : "Không xác định"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        Thời gian:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {getCurrentDate()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={() => navigate("checkout")}
                  className="flex items-center justify-center gap-2 h-12"
                >
                  <RotateCcw className="h-4 w-4" />
                  Thử lại thanh toán
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {}}
                  className="flex items-center justify-center gap-2 h-12"
                >
                  <ArrowRight className="h-4 w-4" />
                  Liên hệ hỗ trợ
                </Button>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="space-y-6">
              <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="mx-auto w-20 h-20 bg-yellow-100 dark:bg-yellow-800/30 rounded-full flex items-center justify-center mb-4">
                      <AlertTriangle className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mb-2">
                      Lỗi hệ thống
                    </h1>
                    <p className="text-yellow-700 dark:text-yellow-400">
                      Có lỗi xảy ra trong quá trình xử lý thanh toán
                    </p>
                  </div>

                  <Badge className="bg-yellow-600 dark:bg-yellow-500 text-white hover:bg-yellow-700 dark:hover:bg-yellow-600">
                    Lỗi hệ thống
                  </Badge>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={() => navigate("checkout")}
                  className="flex items-center justify-center gap-2 h-12"
                >
                  <RotateCcw className="h-4 w-4" />
                  Thử lại
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex items-center justify-center gap-2 h-12"
                >
                  <Home className="h-4 w-4" />
                  Về trang chủ
                </Button>
              </div>
            </div>
          )}

          {/* Unknown Status */}
          {!["success", "failed", "error"].includes(status || "") && (
            <Card className="shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="h-10 w-10 text-gray-500 dark:text-gray-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Trạng thái không xác định
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Không thể xác định trạng thái thanh toán
                  </p>
                </div>

                <Button onClick={() => navigate("/")} className="h-12 px-8">
                  Về trang chủ
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
