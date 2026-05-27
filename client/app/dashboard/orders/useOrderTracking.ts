"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Order, OrderStatus } from "./types";

interface UseOrderTrackingOptions {
  orderId: string;
  /** Pass a real WebSocket URL like "ws://localhost:8000/ws/orders/{id}/" */
  wsUrl?: string;
  /** Polling interval in ms when WebSocket is not available (default 15 000) */
  pollInterval?: number;
}

interface UseOrderTrackingResult {
  order: Order | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Mock data for development ────────────────────────────────────────────────
function mockOrder(id: string): Order {
  return {
    id,
    orderNumber: `ORD-${id.slice(-6).toUpperCase()}`,
    status: "PREPARING",
    placedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
    restaurantName: "The Spice Garden",
    restaurantImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
    items: [
      { id: "1", name: "Butter Chicken", quantity: 1, price: 14.99 },
      { id: "2", name: "Garlic Naan × 2", quantity: 2, price: 3.49 },
      { id: "3", name: "Mango Lassi", quantity: 1, price: 4.99 },
    ],
    subtotal: 26.96,
    deliveryFee: 2.99,
    tax: 2.43,
    total: 32.38,
    deliveryAddress: "42 Maple Street, Apt 3B, Chennai 600001",
    deliveryPartner: {
      name: "Ravi Kumar",
      phone: "+91 98765 43210",
    },
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useOrderTracking({
  orderId,
  wsUrl,
  pollInterval = 15_000,
}: UseOrderTrackingOptions): UseOrderTrackingResult {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      // ── Replace with real API call ──────────────────────────────────────────
      // const res = await fetch(`/api/orders/${orderId}`);
      // if (!res.ok) throw new Error("Failed to fetch order");
      // const data: Order = await res.json();
      // setOrder(data);
      // ───────────────────────────────────────────────────────────────────────

      // Mock: simulate network delay
      await new Promise((r) => setTimeout(r, 600));
      setOrder(mockOrder(orderId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Connect WebSocket if URL provided
  useEffect(() => {
    if (!wsUrl) return;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as { status: OrderStatus };
        setOrder((prev) => (prev ? { ...prev, status: data.status } : prev));
      } catch {
        // ignore malformed messages
      }
    };

    ws.onerror = () => setError("Real-time connection lost. Retrying…");
    ws.onclose = () => {
      // Fallback to polling if WS closes unexpectedly
      pollRef.current = setInterval(fetchOrder, pollInterval);
    };

    return () => {
      ws.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [wsUrl, fetchOrder, pollInterval]);

  // Polling fallback when no WebSocket URL
  useEffect(() => {
    if (wsUrl) return;
    fetchOrder();
    pollRef.current = setInterval(fetchOrder, pollInterval);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [wsUrl, fetchOrder, pollInterval]);

  return { order, loading, error, refetch: fetchOrder };
}
