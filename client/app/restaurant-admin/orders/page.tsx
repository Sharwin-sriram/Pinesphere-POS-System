"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2, XCircle, Clock, ChefHat, Package, Eye,
  RefreshCw, UtensilsCrossed, AlertCircle, Bike,
} from "lucide-react";
import { httpClient } from "../../lib/authService";

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderItem = {
  id: string | number;
  name: string;
  quantity: number;
  unit_price: string | number;
  total_price?: string | number;
};

type BackendOrder = {
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
  metadata?: {
    customer_name?: string;
    customer_phone?: string;
    order_type?: string;
    delivery_address?: string;
  };
  notes?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function orderNumber(o: BackendOrder) {
  return o.external_id || `ORD-${String(o.id).padStart(5, "0")}`;
}
function customerName(o: BackendOrder) {
  return o.metadata?.customer_name || "Guest";
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
function elapsed(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; tab: string; color: string; dot: string; badge: string }> = {
  pending:          { label: "New Order",          tab: "New",       color: "text-orange-700", dot: "bg-orange-500", badge: "bg-orange-50 border-orange-200 text-orange-700" },
  confirmed:        { label: "Confirmed",           tab: "New",       color: "text-blue-700",   dot: "bg-blue-500",   badge: "bg-blue-50 border-blue-200 text-blue-700"         },
  preparing:        { label: "Preparing",           tab: "Preparing", color: "text-amber-700",  dot: "bg-amber-500",  badge: "bg-amber-50 border-amber-200 text-amber-700"       },
  ready:            { label: "Ready for Pickup",    tab: "Ready",     color: "text-emerald-700",dot: "bg-emerald-500",badge: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  out_for_delivery: { label: "Out for Delivery",    tab: "Delivered", color: "text-violet-700", dot: "bg-violet-500", badge: "bg-violet-50 border-violet-200 text-violet-700"   },
  delivered:        { label: "Delivered",           tab: "Delivered", color: "text-emerald-700",dot: "bg-emerald-500",badge: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  cancelled:        { label: "Cancelled",           tab: "Cancelled", color: "text-red-700",    dot: "bg-red-500",    badge: "bg-red-50 border-red-200 text-red-700"             },
};
const cfgOf = (s: string) => STATUS_CFG[s] ?? { label: s, tab: "All", color: "text-gray-700", dot: "bg-gray-400", badge: "bg-gray-50 border-gray-200 text-gray-700" };

const TABS = ["All", "New", "Preparing", "Ready", "Delivered", "Cancelled"] as const;

// ─── Order Detail Modal ───────────────────────────────────────────────────────
function OrderModal({ order, onClose }: { order: BackendOrder; onClose: () => void }) {
  const cfg = cfgOf(order.status);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] shadow-2xl animate-fade-in-up overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div>
            <p className="text-xs text-[var(--color-text-muted)] font-medium">{orderNumber(order)}</p>
            <h2 className="text-base font-bold text-[var(--color-text-primary)] mt-0.5">{customerName(order)}</h2>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Meta */}
          <div className="flex gap-4 text-xs text-[var(--color-text-muted)]">
            <span>{formatDate(order.placed_at || order.created_at)} · {formatTime(order.placed_at || order.created_at)}</span>
            {order.delivery_type && (
              <span className="capitalize font-medium text-[var(--color-text-secondary)]">{order.delivery_type.replace("_", " ")}</span>
            )}
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Items</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-tertiary)] text-[10px] font-bold text-[var(--color-text-secondary)]">
                      {item.quantity}
                    </span>
                    <span className="text-sm text-[var(--color-text-primary)]">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-[var(--color-text-secondary)] shrink-0">
                    ₹{(Number(item.unit_price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery address */}
          {(order.delivery_address || order.metadata?.delivery_address) && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Delivery Address</p>
              <p className="text-sm text-[var(--color-text-primary)]">{order.delivery_address || order.metadata?.delivery_address}</p>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Notes</p>
              <p className="text-sm text-[var(--color-text-secondary)]">{order.notes}</p>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center pt-3 border-t border-[var(--color-border)]">
            <span className="text-sm font-semibold text-[var(--color-text-secondary)]">Total</span>
            <span className="text-lg font-bold text-[var(--color-text-primary)]">₹{Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[var(--color-border)]">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-[var(--color-border)] py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({
  order,
  onAction,
  actioning,
  onView,
}: {
  order: BackendOrder;
  onAction: (id: string | number, status: string) => void;
  actioning: boolean;
  onView: (o: BackendOrder) => void;
}) {
  const cfg = cfgOf(order.status);
  const isPending   = order.status === "pending";
  const isPreparing = order.status === "preparing";
  const isReady     = order.status === "ready";
  const isClosed    = ["delivered", "cancelled", "out_for_delivery"].includes(order.status);

  return (
    <div className={`flex flex-col rounded-2xl border bg-[var(--color-bg-secondary)] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
      isPending ? "border-orange-200" : "border-[var(--color-border)]"
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <div>
          <p className="text-xs text-[var(--color-text-muted)]">{orderNumber(order)}</p>
          <p className="text-sm font-bold text-[var(--color-text-primary)] mt-0.5">{customerName(order)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isPending ? "animate-pulse" : ""} ${cfg.dot}`} />
            {cfg.label}
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" /> {elapsed(order.placed_at || order.created_at)}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 px-4 py-3 space-y-1.5">
        {order.items.slice(0, 3).map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-text-secondary)] flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-bg-tertiary)] text-[10px] font-bold text-[var(--color-text-muted)]">
                {item.quantity}
              </span>
              <span className="truncate max-w-[140px]">{item.name}</span>
            </span>
            <span className="text-[var(--color-text-muted)] text-xs shrink-0">
              ₹{(Number(item.unit_price) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
        {order.items.length > 3 && (
          <p className="text-xs text-[var(--color-text-muted)]">+{order.items.length - 3} more items</p>
        )}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/40">
        <span className="text-xs text-[var(--color-text-muted)]">Total</span>
        <span className="text-base font-bold text-[var(--color-text-primary)]">₹{Number(order.total_amount).toFixed(2)}</span>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 flex gap-2">
        {/* View */}
        <button
          onClick={() => onView(order)}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-all"
        >
          <Eye className="h-3.5 w-3.5" /> View
        </button>

        {/* Pending: Accept + Reject */}
        {isPending && (
          <>
            <button
              disabled={actioning}
              onClick={() => onAction(order.id, "cancelled")}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 transition-all"
            >
              <XCircle className="h-3.5 w-3.5" /> Reject
            </button>
            <button
              disabled={actioning}
              onClick={() => onAction(order.id, "preparing")}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-all"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {actioning ? "Accepting…" : "Accept & Prepare"}
            </button>
          </>
        )}

        {/* Preparing: Mark Ready */}
        {isPreparing && (
          <button
            disabled={actioning}
            onClick={() => onAction(order.id, "ready")}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-all"
          >
            <Package className="h-3.5 w-3.5" />
            {actioning ? "Updating…" : "Mark Ready for Pickup"}
          </button>
        )}

        {/* Ready: waiting for delivery */}
        {isReady && (
          <div className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            <Bike className="h-3.5 w-3.5" /> Waiting for Delivery
          </div>
        )}

        {/* Closed: just status pill */}
        {isClosed && (
          <div className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${cfg.badge}`}>
            {order.status === "cancelled" ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            {cfg.label}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("All");
  const [orders,    setOrders]    = useState<BackendOrder[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | number | null>(null);
  const [modal,     setModal]     = useState<BackendOrder | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      const res  = await httpClient.get("/api/v1/orders/");
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
    pollRef.current = setInterval(fetchOrders, 15_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchOrders]);

  // ── Action ─────────────────────────────────────────────────────────────────
  const handleAction = async (id: string | number, newStatus: string) => {
    setActioning(id);
    try {
      const res = await httpClient.post(`/api/v1/orders/${id}/update_status/`, { status: newStatus });
      const updated = res.data?.data;
      if (updated) {
        setOrders(prev => prev.map(o => String(o.id) === String(id) ? { ...o, status: updated.status } : o));
      } else {
        await fetchOrders();
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail ?? "Failed to update order status.");
    } finally {
      setActioning(null);
    }
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (activeTab === "All") return orders;
    return orders.filter(o => cfgOf(o.status).tab === activeTab);
  }, [orders, activeTab]);

  // Badge counts for tabs
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    orders.forEach(o => {
      const tab = cfgOf(o.status).tab;
      c[tab] = (c[tab] || 0) + 1;
    });
    return c;
  }, [orders]);

  return (
    <div className="flex flex-col h-full animate-fade-in-up">

      {/* ── Tab bar ── */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[var(--color-border)] flex-wrap">
        <div className="flex items-center gap-1.5 bg-[var(--color-bg-tertiary)] p-1 rounded-xl flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab}
              id={`orders-tab-${tab.toLowerCase()}`}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-1.5 ${
                activeTab === tab
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
              }`}
            >
              {tab}
              {counts[tab] && counts[tab] > 0 && (
                <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center ${
                  activeTab === tab ? "bg-white/25 text-white" : "bg-orange-500 text-white"
                }`}>
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          id="orders-refresh-btn"
          onClick={() => { setLoading(true); fetchOrders(); }}
          disabled={loading}
          className="ml-auto flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.75} />
          Refresh
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* ── Skeleton ── */}
      {loading && orders.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5 animate-pulse">
              <div className="h-4 w-28 rounded bg-[var(--color-bg-tertiary)] mb-3" />
              <div className="h-3 w-20 rounded bg-[var(--color-bg-tertiary)] mb-2" />
              <div className="h-20 rounded bg-[var(--color-bg-tertiary)] mb-4" />
              <div className="h-9 rounded-xl bg-[var(--color-bg-tertiary)]" />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && filtered.length === 0 && !error && (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-10 text-center">
          <UtensilsCrossed className="mb-4 h-10 w-10 text-[var(--color-text-muted)]" strokeWidth={1.25} />
          <p className="text-base font-semibold text-[var(--color-text-primary)]">
            {activeTab === "All" ? "No orders yet" : `No ${activeTab.toLowerCase()} orders`}
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {activeTab === "All"
              ? "Orders will appear here automatically when customers place them."
              : `Switch to All to see all orders.`}
          </p>
        </div>
      )}

      {/* ── Order grid ── */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onAction={handleAction}
              actioning={actioning === order.id}
              onView={setModal}
            />
          ))}
        </div>
      )}

      {/* ── Detail modal ── */}
      {modal && <OrderModal order={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
