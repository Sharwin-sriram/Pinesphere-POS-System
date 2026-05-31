"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bike, CheckCircle2, Clock, Package, RefreshCw, AlertCircle, UtensilsCrossed } from "lucide-react";
import { httpClient } from "../../../app/lib/authService";

type OrderItem = { id: string | number; name: string; quantity: number; unit_price: string | number };
type Order = {
  id: string | number;
  external_id?: string;
  status: string;
  delivery_type?: string;
  delivery_address?: string | null;
  total_amount: string | number;
  placed_at: string;
  created_at: string;
  restaurant_name?: string;
  items: OrderItem[];
  metadata?: { customer_name?: string; delivery_address?: string };
};

function orderNum(o: Order) { return o.external_id || `ORD-${String(o.id).padStart(5, "0")}`; }
function customerName(o: Order) { return o.metadata?.customer_name || "Guest"; }
function elapsed(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

const STATUS_CFG: Record<string, { label: string; badge: string; dot: string }> = {
  ready:            { label: "Ready for Pickup",  badge: "bg-emerald-50 border-emerald-200 text-emerald-700", dot: "bg-emerald-500" },
  out_for_delivery: { label: "Out for Delivery",  badge: "bg-violet-50 border-violet-200 text-violet-700",   dot: "bg-violet-500"  },
};

export default function ActiveOrdersTable() {
  const [orders,    setOrders]    = useState<Order[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res  = await httpClient.get("/api/v1/orders/?status=ready,out_for_delivery");
      const list = res.data?.data ?? res.data?.results ?? [];
      setOrders(Array.isArray(list) ? list : []);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err?.message ?? "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
    pollRef.current = setInterval(fetchOrders, 20_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchOrders]);

  const handleAction = async (id: string | number, newStatus: string) => {
    setActioning(id);
    try {
      const res     = await httpClient.post(`/api/v1/orders/${id}/update_status/`, { status: newStatus });
      const updated = res.data?.data;
      if (updated) {
        if (newStatus === "delivered") {
          // Remove delivered orders from this view
          setOrders(prev => prev.filter(o => String(o.id) !== String(id)));
        } else {
          setOrders(prev => prev.map(o => String(o.id) === String(id) ? { ...o, status: updated.status } : o));
        }
      } else {
        await fetchOrders();
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail ?? "Failed to update order status.");
    } finally {
      setActioning(null);
    }
  };

  const readyOrders    = orders.filter(o => o.status === "ready");
  const enRouteOrders  = orders.filter(o => o.status === "out_for_delivery");

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Delivery Queue</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {loading ? "Loading…" : `${orders.length} active order${orders.length !== 1 ? "s" : ""} · auto-refreshes every 20s`}
          </p>
        </div>
        <button
          id="delivery-refresh-btn"
          onClick={() => { setLoading(true); fetchOrders(); }}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Skeleton */}
      {loading && orders.length === 0 && (
        <div className="p-6 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
          <UtensilsCrossed className="mb-3 h-9 w-9 text-gray-300" strokeWidth={1.25} />
          <p className="text-sm font-semibold text-gray-700">No orders ready for delivery</p>
          <p className="mt-1 text-xs text-gray-400">Orders marked Ready by the restaurant will appear here.</p>
        </div>
      )}

      {/* Ready for Pickup section */}
      {readyOrders.length > 0 && (
        <div className="px-6 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-3 flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5" /> Ready for Pickup ({readyOrders.length})
          </p>
          <div className="space-y-3">
            {readyOrders.map(order => {
              const cfg = STATUS_CFG.ready;
              return (
                <div key={order.id} className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
                  {/* Order info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900">{orderNum(order)}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cfg.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} /> {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {customerName(order)} · {order.restaurant_name || "Restaurant"} · {elapsed(order.placed_at || order.created_at)}
                    </p>
                    {(order.delivery_address || order.metadata?.delivery_address) && (
                      <p className="text-xs text-gray-600 mt-0.5 truncate">
                        📍 {order.delivery_address || order.metadata?.delivery_address}
                      </p>
                    )}
                  </div>

                  {/* Total */}
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-gray-900">₹{Number(order.total_amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                  </div>

                  {/* Action */}
                  <button
                    id={`pickup-${order.id}`}
                    disabled={actioning === order.id}
                    onClick={() => handleAction(order.id, "out_for_delivery")}
                    className="shrink-0 flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-50 transition-all"
                  >
                    <Bike className="h-3.5 w-3.5" />
                    {actioning === order.id ? "Updating…" : "Out for Delivery"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Divider */}
      {readyOrders.length > 0 && enRouteOrders.length > 0 && (
        <div className="mx-6 border-t border-gray-100" />
      )}

      {/* En Route section */}
      {enRouteOrders.length > 0 && (
        <div className="px-6 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-700 mb-3 flex items-center gap-1.5">
            <Bike className="h-3.5 w-3.5" /> En Route ({enRouteOrders.length})
          </p>
          <div className="space-y-3">
            {enRouteOrders.map(order => {
              const cfg = STATUS_CFG.out_for_delivery;
              return (
                <div key={order.id} className="flex items-center gap-4 rounded-xl border border-violet-100 bg-violet-50/50 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900">{orderNum(order)}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cfg.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${cfg.dot}`} /> {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {customerName(order)} · {order.restaurant_name || "Restaurant"} · {elapsed(order.placed_at || order.created_at)}
                    </p>
                    {(order.delivery_address || order.metadata?.delivery_address) && (
                      <p className="text-xs text-gray-600 mt-0.5 truncate">
                        📍 {order.delivery_address || order.metadata?.delivery_address}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-gray-900">₹{Number(order.total_amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                  </div>

                  <button
                    id={`delivered-${order.id}`}
                    disabled={actioning === order.id}
                    onClick={() => handleAction(order.id, "delivered")}
                    className="shrink-0 flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-all"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {actioning === order.id ? "Updating…" : "Mark Delivered"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      {orders.length > 0 && (
        <div className="flex items-center gap-2 px-6 py-3 border-t border-gray-100 bg-gray-50">
          <Clock className="h-3.5 w-3.5 text-gray-400" />
          <p className="text-xs text-gray-400">Status updates sync automatically with the customer's tracking page</p>
        </div>
      )}
    </div>
  );
}