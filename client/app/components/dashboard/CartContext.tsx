"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import toast from "react-hot-toast";
import { httpClient } from "../../lib/authService";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  restaurant?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: () => Promise<{ success: boolean; data?: any; error?: string }>;
  cartCount: number;
  cartTotal: number;
}

const STORAGE_KEY = "pos_cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from backend cart API on mount
  useEffect(() => {
    let mounted = true;

    const fetchCart = async () => {
      try {
        const res = await httpClient.get("/api/cart/");
        const data = res?.data ?? {};
        const items = Array.isArray(data) ? data : data.items ?? data.cart ?? [];
        if (mounted) setCartItems(items);
      } catch (err) {
        // If unauthenticated or server error, keep empty cart silently
        console.debug("Failed to load cart:", err);
      } finally {
        if (mounted) setHydrated(true);
      }
    };

    fetchCart();

    return () => {
      mounted = false;
    };
  }, []);

  const addToCart = async (item: Omit<CartItem, "quantity">) => {
    try {
      await httpClient.post("/api/cart/add/", {
        item_id: item.id,
        quantity: 1,
      });
      // refresh cart
      const res = await httpClient.get("/api/cart/");
      const data = res?.data ?? {};
      const items = Array.isArray(data) ? data : data.items ?? data.cart ?? [];
      setCartItems(items);
      toast.success(`${item.name} added to cart!`, {
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
    } catch (error) {
      console.error("Add to cart failed", error);
      toast.error("Failed to add to cart");
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      await httpClient.delete(`/api/cart/items/${id}/remove/`);
      setCartItems((prev) => prev.filter((i) => i.id !== id));
    } catch (error) {
      console.error("Remove from cart failed", error);
      toast.error("Failed to remove item");
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }

    try {
      await httpClient.patch(`/api/cart/items/${id}/`, { quantity });
      setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
    } catch (error) {
      console.error("Update cart quantity failed", error);
      toast.error("Failed to update quantity");
    }
  };

  const clearCart = async () => {
    try {
      await httpClient.delete(`/api/cart/clear/`);
      setCartItems([]);
    } catch (error) {
      console.error("Clear cart failed", error);
      toast.error("Failed to clear cart");
    }
  };

  const checkout = async () => {
    try {
      const res = await httpClient.post(`/api/cart/checkout/`);
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Checkout failed", error);
      return { success: false, error: "Checkout failed" };
    }
  };

  const cartCount = cartItems.reduce((t, i) => t + i.quantity, 0);
  const cartTotal = cartItems.reduce((t, i) => t + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, checkout, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
