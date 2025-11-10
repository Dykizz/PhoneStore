"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart, type CartItem } from "@/contexts/cartContexts";
import { formatCurrencyVND } from "@/utils/util";
import type { DetailUser } from "@/types/user.type";
import { getMyProfile } from "@/apis/user.api";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  PaymentMethod,
  type BaseOrder,
  type CreateOrder,
} from "@/types/order.type";
import { createOrder } from "@/apis/order.api";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { showToast } from "@/utils/toast";
import ProductItem from "./ProductItem";
import { createPaymentVNPay } from "@/apis/vnpay.api";
import AddressSelect from "./AddressSelect";

const schema = z.object({
  recipientName: z.string().min(1, "Vui lòng nhập tên người nhận"),
  phoneNumber: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"),
  city: z.string().min(1, "Vui lòng chọn tỉnh/thành phố"),
  district: z.string().min(1, "Vui lòng chọn quận/huyện"),
  ward: z.string().min(1, "Vui lòng chọn phường/xã"),
  street: z.string().min(1, "Vui lòng nhập số nhà, tên đường"),
  paymentMethod: z.string().min(1, "Vui lòng chọn phương thức thanh toán"),
});

type FormData = z.infer<typeof schema>;

const FormInput = ({ label, error, ...props }: any) => (
  <div>
    <Label className="text-sm text-gray-600">{label}</Label>
    <Input
      {...props}
      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-red-500"
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, checkoutSuccess } = useCart();
  const [products, setProducts] = useState<CartItem[]>([]);
  const [inforUser, setInforUser] = useState<DetailUser | null>(null);
  const [cityOptions, setCityOptions] = useState<any[]>([]);
  const [addressLabels, setAddressLabels] = useState({
    city: "",
    district: "",
    ward: "",
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      recipientName: "",
      phoneNumber: "",
      city: "",
      district: "",
      ward: "",
      street: "",
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
    },
  });

  const cityValue = watch("city");
  const districtValue = watch("district");

  const getSelectedProvince = () =>
    cityOptions.find((p) => p.value === cityValue);
  const getSelectedDistrict = () =>
    getSelectedProvince()?.children?.find(
      (d: any) => d.value === districtValue
    );

  const updateAddressLabel = (
    type: "city" | "district" | "ward",
    label: string
  ) => {
    setAddressLabels((prev) => ({ ...prev, [type]: label }));
  };

  const resetChildFields = (level: "city" | "district") => {
    if (level === "city") {
      setValue("district", "");
      setValue("ward", "");
      updateAddressLabel("district", "");
      updateAddressLabel("ward", "");
    } else {
      setValue("ward", "");
      updateAddressLabel("ward", "");
    }
  };

  useEffect(() => {
    setProducts(cartItems.filter((item) => item.selected));
  }, [cartItems]);

  useEffect(() => {
    const fetchUserInfor = async () => {
      const response = await getMyProfile();
      if (!response.success) return navigate("/login");

      setInforUser(response.data);
      setValue("recipientName", response.data.userName || "");
      setValue("phoneNumber", response.data.phoneNumber || "");

      const defaultAddress = response.data.defaultAddress;
      if (defaultAddress) {
        const parts = defaultAddress.split(", ").map((part) => part.trim());
        if (parts.length === 4) setValue("street", parts[0]);
      }
    };
    fetchUserInfor();
  }, [navigate, setValue]);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then((res) => res.json())
      .then((data) => {
        const formattedData = data.map((province: any) => ({
          value: String(province.code),
          label: province.name,
          children: province.districts.map((district: any) => ({
            value: String(district.code),
            label: district.name,
            children: district.wards.map((ward: any) => ({
              value: String(ward.code),
              label: ward.name,
            })),
          })),
        }));
        setCityOptions(formattedData);
      })
      .catch((err) => console.error("Error loading provinces:", err));
  }, []);

  const handleCheckout = handleSubmit(async (data: FormData) => {
    if (products.length === 0) {
      return showToast({
        title: "Lỗi",
        description: "Vui lòng chọn sản phẩm để đặt hàng",
        type: "error",
      });
    }

    const checkoutData: CreateOrder = {
      addressShipping: `${data.street}, ${addressLabels.ward}, ${addressLabels.district}, ${addressLabels.city}`,
      items: products.map((p) => ({
        variantId: p.variantId,
        quantity: p.quantity,
      })),
      paymentMethod: data.paymentMethod as PaymentMethod,
      recipientName: data.recipientName,
      phoneNumber: data.phoneNumber,
    };

    try {
      const response = await createOrder(checkoutData);
      if (!response.success) {
        throw new Error(response.message || "Đặt hàng thất bại");
      }
      const order: BaseOrder = response.data;
      checkoutSuccess();
      if (data.paymentMethod === PaymentMethod.CASH_ON_DELIVERY) {
        showToast({
          title: "Đặt hàng thành công",
          description: "Đơn hàng của bạn đã được đặt thành công!",
          type: "success",
        });
        return navigate("/orders");
      }

      const responseVnpay = await createPaymentVNPay({
        amount: Number(order.totalAmount),
        orderInfo: `Đơn hàng - ${order.id}`,
        email: order.customer.email,
        userName: order.customer.userName,
        orderId: order.id,
        returnUrl: `${window.location.origin}/payment/result`,
      });

      if (responseVnpay.success && responseVnpay.data?.vnpUrl) {
        window.location.href = responseVnpay.data.vnpUrl;
      } else {
        showToast({
          title: "Lỗi thanh toán",
          description: responseVnpay.message || "Tạo thanh toán VNPay thất bại",
          type: "error",
        });
      }
    } catch (error) {
      showToast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        type: "error",
      });
    }
  });

  if (!inforUser) return null;

  const totalPrice = products.reduce(
    (total, item) => total + item.finalPrice * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-10 relative">
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại giỏ hàng
        </button>

        <h1 className="text-3xl font-bold text-gray-900 text-center mb-10 tracking-tight">
          Thanh toán & Giao hàng
        </h1>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {products.map((product) => (
              <ProductItem key={product.variantId} product={product} />
            ))}

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Thông tin khách hàng
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-gray-900">
                    {inforUser?.userName}
                  </p>
                  <span className="text-gray-700 text-sm">
                    {inforUser?.phoneNumber}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{inforUser.email}</p>
                <p className="text-xs text-gray-400 italic">
                  (*) Hóa đơn VAT sẽ được gửi qua email này
                </p>
              </div>
            </div>

            {/* Card nhận hàng */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Thông tin nhận hàng
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="recipientName"
                    control={control}
                    render={({ field }) => (
                      <FormInput
                        {...field}
                        label="Tên người nhận"
                        error={errors.recipientName?.message}
                      />
                    )}
                  />
                  <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field }) => (
                      <FormInput
                        {...field}
                        label="SĐT người nhận"
                        error={errors.phoneNumber?.message}
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <AddressSelect
                        {...field}
                        label="Tỉnh / Thành phố"
                        placeholder="Chọn tỉnh/thành phố"
                        options={cityOptions}
                        error={errors.city?.message}
                        onValueChange={(value: string) => {
                          field.onChange(value);
                          const selected = cityOptions.find(
                            (p) => p.value === value
                          );
                          updateAddressLabel("city", selected?.label || "");
                          resetChildFields("city");
                        }}
                      />
                    )}
                  />
                  <Controller
                    name="district"
                    control={control}
                    render={({ field }) => (
                      <AddressSelect
                        {...field}
                        label="Quận / Huyện"
                        placeholder="Chọn quận/huyện"
                        options={getSelectedProvince()?.children || []}
                        error={errors.district?.message}
                        onValueChange={(value: string) => {
                          field.onChange(value);
                          const selected =
                            getSelectedProvince()?.children?.find(
                              (d: any) => d.value === value
                            );
                          updateAddressLabel("district", selected?.label || "");
                          resetChildFields("district");
                        }}
                      />
                    )}
                  />
                  <Controller
                    name="ward"
                    control={control}
                    render={({ field }) => (
                      <AddressSelect
                        {...field}
                        label="Phường / Xã"
                        placeholder="Chọn phường/xã"
                        options={getSelectedDistrict()?.children || []}
                        error={errors.ward?.message}
                        onValueChange={(value: string) => {
                          field.onChange(value);
                          const selected =
                            getSelectedDistrict()?.children?.find(
                              (w: any) => w.value === value
                            );
                          updateAddressLabel("ward", selected?.label || "");
                        }}
                      />
                    )}
                  />
                </div>

                <Controller
                  name="street"
                  control={control}
                  render={({ field }) => (
                    <FormInput
                      {...field}
                      label="Số nhà, tên đường"
                      placeholder="Ví dụ: 123 Lê Lợi"
                      error={errors.street?.message}
                    />
                  )}
                />

                <Textarea
                  placeholder="Ghi chú khác (nếu có)"
                  className="rounded-xl border-gray-200 focus:ring-2 focus:ring-red-500"
                />

                <Controller
                  name="paymentMethod"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Label className="text-sm text-gray-600 mb-3 block">
                        Phương thức thanh toán
                      </Label>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={PaymentMethod.CASH_ON_DELIVERY}
                            id="cod"
                          />
                          <Label
                            htmlFor="cod"
                            className="text-sm font-normal cursor-pointer"
                          >
                            Thanh toán khi nhận hàng (COD)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={PaymentMethod.BANK_TRANSFER}
                            id="bank"
                          />
                          <Label
                            htmlFor="bank"
                            className="text-sm font-normal cursor-pointer"
                          >
                            Chuyển khoản ngân hàng
                          </Label>
                        </div>
                      </RadioGroup>
                      {errors.paymentMethod && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.paymentMethod.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Cột phải: Tổng đơn */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-6 h-fit sticky top-10">
            <h2 className="text-lg font-bold mb-5 text-gray-900">
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-3 text-sm text-gray-600">
              {products.map((product) => (
                <div key={product.variantId} className="flex justify-between">
                  <span>
                    {product.name} <strong>x{product.quantity}</strong>
                  </span>
                  <span>
                    {formatCurrencyVND(product.finalPrice * product.quantity)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
            </div>

            <hr className="my-5 border-gray-200" />

            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Tổng cộng</span>
              <span className="text-red-600">
                {formatCurrencyVND(totalPrice)}
              </span>
            </div>

            <Button
              onClick={handleCheckout}
              className="bg-red-600 hover:bg-red-700 text-white text-lg px-10 py-5 rounded-xl w-full"
            >
              Tiếp tục thanh toán
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
