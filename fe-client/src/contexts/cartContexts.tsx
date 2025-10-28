// fe-client/src/contexts/cardContexts.tsx

// SỬA 1: Xóa 'React' (không dùng)
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// SỬA 2: Thêm 'export' để các file khác có thể dùng kiểu này
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
      const existingItemIndex = prevCart.findIndex(
        (cartItem) => cartItem.id === item.id
      );
      if (existingItemIndex > -1) {
        // Nếu có, tăng số lượng sản phẩm
        const updatedCart = [...prevCart];

        // SỬA LỖI CHÍNH Ở ĐÂY:
        // Sửa "existingItemIndexMoi" thành "existingItemIndex"
        updatedCart[existingItemIndex].quantity += item.quantity;

        return updatedCart;
      } else {
        // Nếu chưa, thêm sản phẩm mới vào giỏ hàng
        return [...prevCart, item];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        // Giữ lại logic Math.max(quantity, 1) vì CartPage
        // đã 'disabled' nút trừ, logic này an toàn
        item.id === id ? { ...item, quantity: Math.max(quantity, 1) } : item
      )
    );
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};