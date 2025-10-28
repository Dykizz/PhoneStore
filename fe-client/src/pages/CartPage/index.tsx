import { useCart } from "@/contexts/cartContexts";
import { Button } from "@/components/ui/button";

export function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="container py-12">
      <h2 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h2>

      <div>
        {cart.length === 0 ? (
          <p>Giỏ hàng của bạn đang trống.</p>
        ) : (
          <div>
            {cart.map((item) => (
              <div key={item.id} className="flex items-center mb-6">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                <div className="ml-4 flex-1">
                  <p>{item.name}</p>
                  <p>{item.price.toLocaleString("vi-VN")}₫</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="px-4 py-2 border rounded-lg hover:border-gray-300"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="text-xl">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="px-4 py-2 border rounded-lg hover:border-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Xóa
                </button>
              </div>
            ))}
            <div className="mt-8">
              <p className="text-2xl font-bold">
                Tổng cộng: {calculateTotal().toLocaleString("vi-VN")}₫
              </p>
              <Button className="mt-4 bg-red-600 hover:bg-red-700 text-white">
                Thanh toán
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
