import { getProductVariantsByIds } from "@/apis/product.api";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  price: number;
  finalPrice: number;
  quantity: number;
  maxQuantity: number;
  image: string;
  color: string;
  selected: boolean;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  totalPriceSelected: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  toggleSelectItem: (variantId: string) => void;
  toggleSelectItemAll: (selected: boolean) => void;
  countSelectedItems: () => number;
  checkoutSuccess: () => void;
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

interface ItemInLocalStorage {
  variantId: string;
  quantity: string;
  selected?: boolean;
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const fetchCartItems = async () => {
      const storedCart = localStorage.getItem("cartItems");
      if (storedCart) {
        try {
          const parsedCart = JSON.parse(storedCart).map(
            (item: ItemInLocalStorage) => ({
              variantId: item.variantId,
              quantity: parseInt(item.quantity, 10) || 1,
              selected: item.selected == true,
            })
          );

          const ids = parsedCart.map(
            (item: ItemInLocalStorage) => item.variantId
          );
          const response = await getProductVariantsByIds(ids);
          if (response.success) {
            const mergedItems = response.data.map((item: CartItem) => {
              const storedItem: ItemInLocalStorage = parsedCart.find(
                (stored: ItemInLocalStorage) =>
                  stored.variantId === item.variantId
              );
              const quantity = Math.min(
                parseInt(storedItem.quantity, 10),
                item.maxQuantity
              );
              return {
                ...item,
                selected: storedItem.selected == true,
                quantity,
              };
            });
            setCartItems(mergedItems);
          }
        } catch (error) {
          console.error("Failed to parse cart from localStorage:", error);
          localStorage.removeItem("cartItems");
        }
      }
    };

    fetchCartItems();
  }, []);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const addToCart = (newItemData: CartItem) => {
    setCartItems((prevItems) => {
      const { variantId } = newItemData;
      const existingItemIndex = prevItems.findIndex(
        (item) => item.variantId === variantId
      );

      let updatedItems: CartItem[];
      if (existingItemIndex > -1) {
        updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItemData.quantity;
      } else {
        updatedItems = [...prevItems, newItemData];
      }

      const itemsForStorage = updatedItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity.toString(),
        selected: item.selected,
      }));
      localStorage.setItem("cartItems", JSON.stringify(itemsForStorage));

      return updatedItems;
    });
  };

  const removeFromCart = (variantId: string) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.filter(
        (item) => item.variantId !== variantId
      );

      const itemsForStorage = updatedItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity.toString(),
        selected: item.selected,
      }));
      localStorage.setItem("cartItems", JSON.stringify(itemsForStorage));

      return updatedItems;
    });
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }

    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.variantId === variantId ? { ...item, quantity } : item
      );

      const itemsForStorage = updatedItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity.toString(),
        selected: item.selected,
      }));
      localStorage.setItem("cartItems", JSON.stringify(itemsForStorage));

      return updatedItems;
    });
  };

  const toggleSelectItem = (variantId: string) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.variantId === variantId
          ? { ...item, selected: !item.selected }
          : item
      );
      const itemsForStorage = updatedItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity.toString(),
        selected: item.selected,
      }));
      localStorage.setItem("cartItems", JSON.stringify(itemsForStorage));
      return updatedItems;
    });
  };

  const toggleSelectItemAll = (selected: boolean) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) => ({
        ...item,
        selected,
      }));
      const itemsForStorage = updatedItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity.toString(),
        selected: item.selected,
      }));
      localStorage.setItem("cartItems", JSON.stringify(itemsForStorage));
      return updatedItems;
    });
  };

  const checkoutSuccess = () => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => !item.selected);
      const itemsForStorage = updatedItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity.toString(),
        selected: item.selected,
      }));
      localStorage.setItem("cartItems", JSON.stringify(itemsForStorage));
      return updatedItems;
    });
  };

  const totalPriceSelected = cartItems
    .filter((item) => item.selected)
    .reduce((total, item) => total + item.finalPrice * item.quantity, 0);

  const countSelectedItems = () => {
    return cartItems.filter((item) => item.selected).length;
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cartItems");
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        totalPriceSelected,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleSelectItem,
        toggleSelectItemAll,
        countSelectedItems,
        checkoutSuccess,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
