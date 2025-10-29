import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface CartItem {
  // SỬA 1: Đổi tên 'id' thành 'cartItemId' để rõ ràng hơn
  // Đây sẽ là ID duy nhất cho biến thể (vd: "iphone15-black")
  cartItemId: string;
  productId: string; // Giữ lại ID gốc của sản phẩm
  name: string;
  price: number; // Giá cuối cùng (đã giảm)
  quantity: number;
  image: string;
  // SỬA 2: Thêm thuộc tính để hiển thị biến thể (ví dụ: màu sắc)
  variantInfo?: string; // Ví dụ: "Màu: Đen"
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (item: Omit<CartItem, 'cartItemId'>, variantIdPart: string) => void; // Sửa tham số addToCart
  removeFromCart: (cartItemId: string) => void; // Dùng cartItemId
  updateQuantity: (cartItemId: string, quantity: number) => void; // Dùng cartItemId
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // SỬA 3: Sửa hàm addToCart để nhận thêm variantIdPart
  const addToCart = (newItemData: Omit<CartItem, 'cartItemId'>, variantIdPart: string) => {
    // Tạo ID duy nhất cho biến thể trong giỏ hàng
    const cartItemId = `${newItemData.productId}-${variantIdPart}`;

    setCartItems((prevItems) => {
      // Tìm kiếm dựa trên cartItemId duy nhất này
      const existingItemIndex = prevItems.findIndex(
        (item) => item.cartItemId === cartItemId
      );

      if (existingItemIndex > -1) {
        // Nếu tìm thấy chính xác biến thể này -> tăng số lượng
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItemData.quantity;
        return updatedItems;
      } else {
        // Nếu không tìm thấy -> thêm biến thể mới vào giỏ
        const newItem: CartItem = {
          ...newItemData,
          cartItemId: cartItemId, // Gán ID duy nhất
        };
        return [...prevItems, newItem];
      }
    });
  };

  // SỬA 4: Các hàm khác dùng cartItemId
  const removeFromCart = (cartItemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
