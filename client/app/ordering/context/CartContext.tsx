// ordering/context/CartContext.tsx

"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

interface CartItem {
  id: number;
  name?: string;
  quantity?: number;
  price?: number;
}

interface CartContextType {
  cartItems: CartItem[];

  addToCart: (
    item: CartItem
  ) => void;

  removeFromCart: (
    itemId: number
  ) => void;

  clearCart: () => void;
}

const CartContext =
  createContext<CartContextType | null>(
    null
  );

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  const addToCart = (
    item: CartItem
  ) => {
    setCartItems((prev) => [
      ...prev,
      item,
    ]);
  };

  const removeFromCart = (
    itemId: number
  ) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          item.id !== itemId
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
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCartContext must be used within CartProvider"
    );
  }

  return context;
}