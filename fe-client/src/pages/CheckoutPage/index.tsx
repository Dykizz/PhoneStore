"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { showToast } from "@/utils/toast";
import ProductItem from "./ProductItem";
import { createPaymentVNPay } from "@/apis/vnpay.api";
import AddressSelect from "./AddressSelect";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

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
  note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

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

  const form = useForm<FormData>({
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
      note: "",
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

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
      note: data.note,
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
    <div className="min-h-screen bg-muted pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-10 relative">
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại giỏ hàng
        </button>

        <h1 className="text-3xl font-bold text-foreground text-center mb-10 tracking-tight">
          Thanh toán & Giao hàng
        </h1>

        <Form {...form}>
          <form
            onSubmit={handleCheckout}
            className="grid lg:grid-cols-3 gap-10"
          >
            <div className="lg:col-span-2 space-y-4">
              {products.map((product) => (
                <ProductItem key={product.variantId} product={product} />
              ))}

              <div className="bg-card border rounded-2xl shadow-sm p-6 transition-all">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Thông tin khách hàng
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-foreground">
                      {inforUser?.userName}
                    </p>
                    <span className="text-muted-foreground text-sm">
                      {inforUser?.phoneNumber}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {inforUser.email}
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    (*) Hóa đơn VAT sẽ được gửi qua email này
                  </p>
                </div>
              </div>

              <div className="bg-card border rounded-2xl shadow-sm p-6 transition-all">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Thông tin nhận hàng
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      name="recipientName"
                      control={control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên người nhận</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="phoneNumber"
                      control={control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SĐT người nhận</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tỉnh / Thành phố</FormLabel>
                          <AddressSelect
                            {...field}
                            placeholder="Chọn tỉnh/thành phố"
                            options={cityOptions}
                            onValueChange={(value: string) => {
                              field.onChange(value);
                              const selected = cityOptions.find(
                                (p) => p.value === value
                              );
                              updateAddressLabel("city", selected?.label || "");
                              resetChildFields("city");
                            }}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="district"
                      control={control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quận / Huyện</FormLabel>
                          <AddressSelect
                            {...field}
                            placeholder="Chọn quận/huyện"
                            options={getSelectedProvince()?.children || []}
                            onValueChange={(value: string) => {
                              field.onChange(value);
                              const selected =
                                getSelectedProvince()?.children?.find(
                                  (d: any) => d.value === value
                                );
                              updateAddressLabel(
                                "district",
                                selected?.label || ""
                              );
                              resetChildFields("district");
                            }}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="ward"
                      control={control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phường / Xã</FormLabel>
                          <AddressSelect
                            {...field}
                            placeholder="Chọn phường/xã"
                            options={getSelectedDistrict()?.children || []}
                            onValueChange={(value: string) => {
                              field.onChange(value);
                              const selected =
                                getSelectedDistrict()?.children?.find(
                                  (w: any) => w.value === value
                                );
                              updateAddressLabel("ward", selected?.label || "");
                            }}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    name="street"
                    control={control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số nhà, tên đường</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ví dụ: 123 Lê Lợi" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="note"
                    control={control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghi chú (Tùy chọn)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ghi chú khác (nếu có)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="paymentMethod"
                    control={control}
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Phương thức thanh toán</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="space-y-3"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem
                                  value={PaymentMethod.CASH_ON_DELIVERY}
                                  id="cod"
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor="cod"
                                className="font-normal cursor-pointer"
                              >
                                Thanh toán khi nhận hàng (COD)
                              </FormLabel>
                            </FormItem>

                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem
                                  value={PaymentMethod.BANK_TRANSFER}
                                  id="bank"
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor="bank"
                                className="font-normal cursor-pointer"
                              >
                                Thanh toán qua VNPay
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border shadow-sm p-6 h-fit sticky top-10">
              <h2 className="text-lg font-bold mb-5 text-foreground">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-3 text-sm text-muted-foreground">
                {products.map((product) => (
                  <div key={product.variantId} className="flex justify-between">
                    <span className="text-foreground">
                      {product.name} <strong>x{product.quantity}</strong>
                    </span>
                    <span className="text-foreground">
                      {formatCurrencyVND(product.finalPrice * product.quantity)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="text-foreground">Miễn phí</span>
                </div>
              </div>

              <Separator className="my-5" />

              <div className="flex justify-between text-lg font-bold mb-6">
                <span className="text-foreground">Tổng cộng</span>
                <span className="text-primary">
                  {formatCurrencyVND(totalPrice)}
                </span>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || products.length === 0}
                className="text-lg px-10 h-12 rounded-xl w-full"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  "Tiếp tục thanh toán"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
