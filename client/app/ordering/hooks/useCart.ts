// ordering/hooks/useCart.ts

"use client";

import { useState } from "react";

interface CartItem {
  id: number;
  name?: string;
  quantity?: number;
  price?: number;
}

export default function useCart() {
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

  return {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
  };
}