// Import Link, useCart và kiểu CartItem
import { Link } from "react-router-dom";
import { useCart, type CartItem } from "@/contexts/cartContexts";
import { Button } from "@/components/ui/button";

export function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();

  const handleRemove = (productId: string) => {
    removeFromCart(productId); 
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    // Nếu số lượng giảm xuống dưới 1, coi như xóa sản phẩm
    if (quantity < 1) {
      handleRemove(productId);
    } else {
      updateQuantity(productId, quantity); 
    }
  };

  const calculateTotal = () => {
    return cart.reduce(
      (total: number, item: CartItem) => total + item.price * item.quantity,
      0 
    );
  };

  return (
    <div className="container py-12">
      <h2 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h2>

      <div>
        {cart.length === 0 ? (
          <div className="text-center">
            <p className="text-xl mb-4">Giỏ hàng của bạn đang trống.</p>
            <Button asChild> 
              <Link to="/">Quay lại trang chủ</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cột trái: Danh sách sản phẩm trong giỏ */}
            <div className="lg:col-span-2 space-y-6">
              {/* Lặp qua từng sản phẩm trong giỏ hàng */}
              {cart.map((item: CartItem) => (
                // Mỗi sản phẩm là một div có border
                <div
                  key={item.id} // Key là ID sản phẩm
                  className="flex items-center gap-4 p-4 border rounded-lg shadow-sm"
                >
                  {/* Ảnh sản phẩm */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  {/* Thông tin tên và giá */}
                  <div className="ml-4 flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-red-600 font-bold">
                      {item.price.toLocaleString("vi-VN")}₫ {/* Giá đã thêm vào giỏ */}
                    </p>
                  </div>
                  {/* Phần tăng giảm số lượng */}
                  <div className="flex items-center gap-2">
                    {/* Nút giảm */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1) // Gọi hàm xử lý
                      }
                      className="w-8 h-8"
                      // Không cần disabled vì logic handleQuantityChange đã xử lý
                    >
                      -
                    </Button>
                    {/* Hiển thị số lượng */}
                    <span className="text-xl w-10 text-center">
                      {item.quantity}
                    </span>
                    {/* Nút tăng */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1) // Gọi hàm xử lý
                      }
                      className="w-8 h-8"
                    >
                      +
                    </Button>
                  </div>
                  {/* Nút xóa sản phẩm */}
                  <Button
                    variant="ghost" // Nút không có nền
                    size="icon"
                    onClick={() => handleRemove(item.id)} // Gọi hàm xử lý
                    className="text-red-600 hover:text-red-800"
                  >
                    Xóa
                  </Button>
                </div>
              ))}
            </div>

            {/* Cột phải: Tóm tắt đơn hàng */}
            <div className="lg:col-span-1 p-6 border rounded-lg shadow-sm h-fit"> {/* h-fit để chiều cao tự động */}
              <h3 className="text-2xl font-bold mb-4">Tổng cộng</h3>
              {/* Tạm tính */}
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tạm tính</span>
                <span className="font-semibold">
                  {calculateTotal().toLocaleString("vi-VN")}₫ {/* Gọi hàm tính tổng */}
                </span>
              </div>
              {/* Phí vận chuyển (ví dụ) */}
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span className="font-semibold">Miễn phí</span>
              </div>
              <hr className="my-4" /> {/* Đường kẻ ngang */}
              {/* Tổng tiền cuối cùng */}
              <div className="flex justify-between text-xl font-bold">
                <span>Tổng tiền</span>
                <span>{calculateTotal().toLocaleString("vi-VN")}₫</span>
              </div>
              {/* Nút Thanh toán */}
              <Button className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white">
                Tiến hành thanh toán
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}