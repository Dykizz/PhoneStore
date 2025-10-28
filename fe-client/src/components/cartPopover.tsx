import { ShoppingCart, Trash2 } from 'lucide-react'; // Chỉ cần Trash2 nếu không dùng icon giỏ trống
import { useCart } from '@/contexts/cartContexts'; // Import hook
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'; // Import component Popover của shadcn/ui
import { Link } from 'react-router-dom';

// Hàm định dạng giá (có thể đưa ra file utils nếu dùng nhiều nơi)
function formatPrice(price: number) {
  return price.toLocaleString('vi-VN') + '₫';
}

export function CartPopover() {
  // Lấy dữ liệu và hàm cần thiết từ CartContext
  const { cartItems, cartCount, removeFromCart, updateQuantity } = useCart();

  // Tính tổng tiền của giỏ hàng
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <Popover>
      {/* Phần Trigger: Nút icon giỏ hàng */}
      <PopoverTrigger asChild>
        {/* asChild để Popover dùng button bên trong làm trigger */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ShoppingCart className="h-6 w-6 text-gray-700" /> {/* Icon giỏ hàng */}
          {/* Badge hiển thị số lượng */}
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {cartCount} {/* Hiển thị tổng số lượng */}
            </span>
          )}
        </button>
      </PopoverTrigger>

      {/* Phần Content: Nội dung Popover */}
      <PopoverContent className="w-96 p-0 shadow-lg border rounded-lg" align="end"> {/* Style cơ bản */}
        {/* Header của Popover */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg text-gray-800">Giỏ hàng của bạn</h3>
          {/* Hiển thị số lượng sản phẩm (loại sản phẩm, không phải tổng số lượng) */}
          <span className="text-sm text-gray-500">
            {cartItems.length} loại sản phẩm
          </span>
        </div>

        {/* Phần danh sách sản phẩm */}
        {/* Giới hạn chiều cao và cho phép cuộn */}
        <div className="max-h-96 overflow-y-auto">
          {cartItems.length === 0 ? (
            // Trường hợp giỏ hàng trống
            <div className="p-8 text-center text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">Giỏ hàng của bạn đang trống</p>
            </div>
          ) : (
            // Trường hợp có sản phẩm
            // Dùng divide-y để tạo đường kẻ giữa các sản phẩm
            <div className="divide-y divide-gray-100">
              {/* Lặp qua danh sách sản phẩm */}
              {cartItems.map((item) => (
                <div key={item.id} className="p-4 flex gap-4 items-start"> {/* items-start để nút xóa thẳng hàng */}
                  {/* Ảnh sản phẩm */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded" // Giảm kích thước ảnh 1 chút
                  />

                  {/* Thông tin sản phẩm */}
                  <div className="flex-1 min-w-0"> {/* min-w-0 để truncate hoạt động */}
                    {/* Tên sản phẩm (truncate nếu quá dài) */}
                    <h4 className="font-medium text-sm text-gray-800 truncate mb-1">
                      {item.name}
                    </h4>
                    {/* Giá sản phẩm */}
                    <p className="text-red-600 font-semibold text-sm">
                      {formatPrice(item.price)}
                    </p>

                    {/* Điều chỉnh số lượng */}
                    <div className="flex items-center gap-2 mt-2">
                      {/* Nút giảm */}
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1) // Gọi hàm updateQuantity
                        }
                        className="w-6 h-6 border rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300"
                        aria-label="Giảm số lượng"
                      >
                        -
                      </button>
                      {/* Hiển thị số lượng */}
                      <span className="text-sm w-8 text-center font-medium text-gray-700">
                        {item.quantity}
                      </span>
                      {/* Nút tăng */}
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1) // Gọi hàm updateQuantity
                        }
                        className="w-6 h-6 border rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300"
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Nút xóa sản phẩm */}
                  <button
                    onClick={() => removeFromCart(item.id)} // Gọi hàm removeFromCart
                    className="text-gray-400 hover:text-red-500 p-1 mt-1" // Thêm margin top nhỏ
                    aria-label="Xóa sản phẩm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Phần Footer của Popover (chỉ hiển thị nếu có sản phẩm) */}
        {cartItems.length > 0 && (
          <div className="border-t p-4 space-y-3 bg-gray-50 rounded-b-lg"> {/* Nền xám nhạt */}
            {/* Tổng tiền */}
            <div className="flex items-center justify-between font-semibold text-gray-800">
              <span>Tổng cộng:</span>
              <span className="text-red-600 text-lg">
                {formatPrice(totalPrice)} {/* Hiển thị tổng tiền */}
              </span>
            </div>
            {/* Nút xem giỏ hàng */}
            <Link to="/cart" className="block"> {/* className="block" để Link chiếm full width */}
              <Button className="w-full" variant="outline">
                Xem chi tiết giỏ hàng
              </Button>
            </Link>
            {/* Nút thanh toán */}
            <Link to="/checkout" className="block"> {/* Giả sử có trang /checkout */}
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                Thanh toán ngay
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}