import { useState } from "react";
import { useCart, type CartItem } from "@/contexts/cartContexts"; // Import hook và kiểu
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom"; // Hook để điều hướng
import { showToast } from "@/utils/toast"; // Hàm hiển thị toast (nếu có)

// Hàm định dạng giá
function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "₫";
}

export function CheckoutPage() {
  // Lấy giỏ hàng và hàm clearCart từ context
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate(); // Hook để chuyển trang

  // State cho thông tin form (ví dụ đơn giản)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // Mặc định là COD

  // Tính tổng tiền
  const totalPrice = cartItems.reduce(
    (total: number, item: CartItem) => total + item.price * item.quantity,
    0
  );

  // Xử lý khi nhấn nút Đặt hàng
  const handlePlaceOrder = (event: React.FormEvent) => {
    event.preventDefault(); // Ngăn form submit mặc định

    // --- KIỂM TRA DỮ LIỆU ---
    if (cartItems.length === 0) {
      showToast({ type: "error", title: "Giỏ hàng trống!" });
      navigate("/cart"); // Chuyển về trang giỏ hàng
      return;
    }
    if (!name || !phone || !address) {
      showToast({
        type: "warning",
        title: "Vui lòng nhập đầy đủ thông tin giao hàng.",
      });
      return;
    }

    // --- CHUẨN BỊ DỮ LIỆU ĐỂ GỬI ĐI ---
    const orderData = {
      customerInfo: { name, phone, address, note },
      items: cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price, // Giá tại thời điểm đặt hàng
      })),
      totalPrice: totalPrice,
      paymentMethod: paymentMethod,
      // Thêm các thông tin khác nếu cần (userId, email...)
    };

    console.log("Dữ liệu đơn hàng chuẩn bị gửi:", orderData);

    // --- GỬI ĐƠN HÀNG LÊN BACKEND (GIẢ LẬP) ---
    // Trong thực tế, bạn sẽ gọi API ở đây
    // Ví dụ: const response = await api.post('/orders', orderData);
    // Dựa vào response để xử lý tiếp
    const isOrderSuccessful = true; // Giả lập thành công

    if (isOrderSuccessful) {
      showToast({
        type: "success",
        title: "Đặt hàng thành công!",
        description: "Cảm ơn bạn đã mua hàng.",
      });
      clearCart(); // Xóa giỏ hàng sau khi đặt thành công
      navigate("/"); // Chuyển về trang chủ
    } else {
      showToast({
        type: "error",
        title: "Đặt hàng thất bại",
        description: "Đã có lỗi xảy ra, vui lòng thử lại.",
      });
    }
  };

  // Nếu giỏ hàng trống, có thể hiển thị thông báo khác hoặc chuyển hướng sớm
  // if (cartItems.length === 0 && !loading) { // Cần thêm state loading nếu lấy cart từ API
  //   return <div className="container py-8">Giỏ hàng của bạn đang trống.</div>;
  // }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Thanh toán</h1>
      {/* Layout 2 cột */}
      <form
        onSubmit={handlePlaceOrder}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12"
      >
        {/* Cột trái: Thông tin giao hàng & Thanh toán */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thông tin giao hàng */}
          <div className="border rounded-lg p-6 shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xxxxxxxx"
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Địa chỉ nhận hàng</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  required
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="note">Ghi chú (Tùy chọn)</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Giao hàng giờ hành chính"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div className="border rounded-lg p-6 shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-4">
              Phương thức thanh toán
            </h2>
            {/* Sử dụng RadioGroup của shadcn/ui */}
            <RadioGroup
              defaultValue="cod"
              value={paymentMethod}
              onValueChange={setPaymentMethod} // Cập nhật state khi chọn
            >
              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="cursor-pointer flex-1">
                  Thanh toán khi nhận hàng (COD)
                </Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-md mt-2">
                <RadioGroupItem value="card" id="card" disabled />{" "}
                {/* Ví dụ: Tạm disable */}
                <Label htmlFor="card" className="cursor-pointer flex-1 text-gray-400">
                  Thanh toán bằng thẻ (Sắp có)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Cột phải: Tóm tắt đơn hàng */}
        <div className="lg:col-span-1 border rounded-lg p-6 shadow-sm bg-white h-fit sticky top-24">
          <h2 className="text-xl font-semibold mb-4 border-b pb-3">
            Tóm tắt đơn hàng
          </h2>
          {/* Danh sách sản phẩm */}
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    SL: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          {/* Chi tiết tổng tiền */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tạm tính</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Phí vận chuyển</span>
              <span>Miễn phí</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2">
              <span>Tổng cộng</span>
              <span className="text-red-600">{formatPrice(totalPrice)}</span>
            </div>
          </div>
          {/* Nút đặt hàng */}
          <Button
            type="submit" // Quan trọng: type="submit" để kích hoạt onSubmit của form
            className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white"
            disabled={cartItems.length === 0} // Disable nút nếu giỏ hàng trống
          >
            Đặt hàng
          </Button>
        </div>
      </form>
    </div>
  );
}