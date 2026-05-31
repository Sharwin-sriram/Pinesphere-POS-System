"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { httpClient } from "../../lib/authService";
import { Order, OrderStatus } from "./types";

interface UseOrderTrackingOptions {
  orderId: string;
  /** Polling interval in ms (default 20 000) */
  pollInterval?: number;
}

interface UseOrderTrackingResult {
  order: Order | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Status map: backend → frontend ──────────────────────────────────────────
const STATUS_MAP: Record<string, OrderStatus> = {
  // backend lowercase values
  pending:          "PLACED",
  confirmed:        "ACCEPTED",
  preparing:        "PREPARING",
  ready:            "READY_FOR_PICKUP",
  out_for_delivery: "OUT_FOR_DELIVERY",
  delivered:        "DELIVERED",
  cancelled:        "CANCELLED",
  payment_failed:   "PAYMENT_FAILED",
  refunded:         "REFUNDED",
  // pass-through if already uppercase
  PLACED:           "PLACED",
  ACCEPTED:         "ACCEPTED",
  PREPARING:        "PREPARING",
  READY_FOR_PICKUP: "READY_FOR_PICKUP",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED:        "DELIVERED",
  CANCELLED:        "CANCELLED",
  PAYMENT_FAILED:   "PAYMENT_FAILED",
  REFUNDED:         "REFUNDED",
};

function mapStatus(raw: string): OrderStatus {
  return STATUS_MAP[raw] ?? "PLACED";
}

// ─── Transform raw API response → Order type ─────────────────────────────────
function mapBackendOrder(raw: any): Order {
  const status = mapStatus(raw.status ?? "pending");

  const items = (raw.items ?? []).map((it: any) => {
    const unitPrice = parseFloat(it.unit_price ?? 0);
    return {
      id:       String(it.id),
      name:     it.name ?? "Item",
      quantity: Number(it.quantity ?? 1),
      price:    unitPrice,
    };
  });

  const total     = parseFloat(raw.total_amount ?? 0);
  const subtotal  = items.reduce(
    (sum: number, it: { price: number; quantity: number }) => sum + it.price * it.quantity,
    0
  );

  return {
    id:                String(raw.id),
    orderNumber:       raw.external_id ?? `ORD-${String(raw.id).padStart(6, "0")}`,
    status,
    placedAt:          raw.placed_at ?? raw.created_at,
    estimatedDelivery: raw.scheduled_at ?? undefined,
    restaurantName:    raw.restaurant_name ?? "Restaurant",
    restaurantImage:   undefined,
    items,
    subtotal,
    deliveryFee:       0,
    tax:               0,
    total,
    deliveryAddress:   raw.delivery_address ?? "",
    cancellationReason: raw.metadata?.cancellation_reason,
  };
}

// ─── Hook: single order tracking ─────────────────────────────────────────────
export function useOrderTracking({
  orderId,
  pollInterval = 20_000,
}: UseOrderTrackingOptions): UseOrderTrackingResult {
  const [order, setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const pollRef             = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef          = useRef(true);

  const fetchOrder = useCallback(async () => {
    try {
      const res  = await httpClient.get(`/api/v1/orders/${orderId}/`);
      const raw  = res.data?.data ?? res.data;
      if (!mountedRef.current) return;
      setOrder(mapBackendOrder(raw));
      setError(null);
    } catch (err: any) {
      if (!mountedRef.current) return;
      const msg =
        err?.response?.data?.detail ??
        err?.message ??
        "Failed to load order.";
      setError(msg);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    fetchOrder();
    pollRef.current = setInterval(fetchOrder, pollInterval);
    return () => {
      mountedRef.current = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchOrder, pollInterval]);

  return { order, loading, error, refetch: fetchOrder };
}

// ─── Hook: all orders list ────────────────────────────────────────────────────
interface UseOrdersListResult {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOrdersList(pollInterval = 30_000): UseOrdersListResult {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const pollRef               = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef            = useRef(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res  = await httpClient.get("/api/v1/orders/");
      const list = res.data?.data ?? res.data ?? [];
      if (!mountedRef.current) return;
      setOrders(Array.isArray(list) ? list.map(mapBackendOrder) : []);
      setError(null);
    } catch (err: any) {
      if (!mountedRef.current) return;
      const msg =
        err?.response?.data?.detail ??
        err?.message ??
        "Failed to load orders.";
      setError(msg);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    fetchOrders();
    pollRef.current = setInterval(fetchOrders, pollInterval);
    return () => {
      mountedRef.current = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchOrders, pollInterval]);

  return { orders, loading, error, refetch: fetchOrders };
}
