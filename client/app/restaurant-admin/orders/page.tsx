"use client";

import { CheckCircle, Clock, Pencil, Trash2, X } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { httpClient } from "../../lib/authService";

type BackendOrderItem = {
  id: string;
  item_name: string;
  quantity: number;
  unit_price: string | number;
  special_instructions?: string;
  status?: string;
};

type BackendOrder = {
  id: string;
  order_number: string;
  status: string;
  customer_name?: string;
  customer_phone?: string;
  total_amount: string | number;
  notes?: string;
  items: BackendOrderItem[];
  created_at: string;
  updated_at: string;
};

function mapStatus(status: string) {
  switch (status.toLowerCase()) {
    case "ready":
      return "Ready";
    case "served":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "confirmed":
    case "preparing":
    case "pending":
    default:
      return "In Process";
  }
}

function mapStatusLabel(status: string) {
  switch (status.toLowerCase()) {
    case "ready":
      return "Ready to serve";
    case "served":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "confirmed":
      return "Order confirmed";
    case "preparing":
      return "Cooking now";
    case "pending":
    default:
      return "New order";
  }
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString([], { weekday: "long", day: "numeric", month: "short", year: "numeric" });
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState("0.00");
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = ["All", "In Process", "Ready", "Completed", "Cancelled"];
  const pinPad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "x"];

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpClient.get("/api/v1/orders/");
      const results = response.data?.data?.results ?? response.data?.results ?? [];
      setOrders(Array.isArray(results) ? results : []);
      setError(null);
    } catch (fetchError: any) {
      const message = fetchError?.response?.data?.detail || fetchError?.response?.data?.message || "Failed to load orders";
      setError(message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const timer = window.setInterval(fetchOrders, 15000);
    return () => window.clearInterval(timer);
  }, [fetchOrders]);

  const handlePinPress = (key: string) => {
    if (key === "x") {
      setTipAmount("0.00");
    } else {
      if (tipAmount === "0.00") setTipAmount(key + ".00");
      else setTipAmount(tipAmount.split(".")[0] + key + ".00");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders
      .map((order) => ({
        ...order,
        displayStatus: mapStatus(order.status),
        displayStatusLabel: mapStatusLabel(order.status),
      }))
      .filter((order) => activeTab === "All" || order.displayStatus === activeTab)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [activeTab, orders]);

  return (
    <div className="flex flex-col h-full animate-fade-in-up">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 bg-[var(--color-bg-tertiary)] p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold text-[length:var(--text-sm)] transition-all ${
                activeTab === tab
                  ? "bg-[var(--color-accent-green)] text-white shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <Button variant="success-outline" size="sm" className="ml-auto" onClick={fetchOrders} loading={loading}>
          Refresh Orders
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && filteredOrders.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="card-light !p-5 animate-pulse">
              <div className="h-5 w-32 rounded bg-[var(--color-bg-tertiary)] mb-4" />
              <div className="h-4 w-20 rounded bg-[var(--color-bg-tertiary)] mb-2" />
              <div className="h-24 rounded bg-[var(--color-bg-tertiary)] mb-4" />
              <div className="h-10 rounded bg-[var(--color-bg-tertiary)]" />
            </div>
          ))}
        </div>
      )}

      {!loading && filteredOrders.length === 0 && !error && (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-10 text-center">
          <CheckCircle className="mb-4 h-10 w-10 text-[var(--color-text-muted)]" strokeWidth={1.5} />
          <p className="text-base font-semibold text-[var(--color-text-primary)]">No orders yet</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Once a customer places an order, it will appear here automatically.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map((order: any) => (
          <div key={order.id} className="card-light !p-5 flex flex-col hover:border-[var(--color-accent-green)] transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-xl text-lg font-semibold ${
                    order.displayStatus === "Ready"
                      ? "bg-[var(--color-accent-green-subtle)] text-[var(--color-accent-green)]"
                      : "bg-[var(--color-blue-subtle)] text-[var(--color-blue)]"
                  }`}
                >
                  {order.order_number.slice(-2)}
                </div>
                <div>
                  <h3 className="text-[var(--color-text-primary)] font-semibold text-[length:var(--text-base)]">
                    {order.customer_name || "Guest order"}
                  </h3>
                  <p className="text-[length:var(--text-xs)] text-[var(--color-text-muted)]">Order # {order.order_number}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Badge
                  variant={order.displayStatus === "Cancelled" ? "danger" : order.displayStatus === "Completed" || order.displayStatus === "Ready" ? "success" : "warning"}
                  className="mb-1"
                >
                  <CheckCircle className="h-3 w-3" strokeWidth={2} /> {order.displayStatus}
                </Badge>
                <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1 mt-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      order.displayStatus === "Ready"
                        ? "bg-[var(--color-accent-green)]"
                        : order.displayStatus === "Cancelled"
                          ? "bg-[var(--color-danger)]"
                          : "bg-[var(--color-accent)]"
                    }`}
                  />
                  {order.displayStatusLabel}
                </span>
              </div>
            </div>

            <div className="text-[length:var(--text-xs)] text-[var(--color-text-secondary)] mb-4 pb-4 border-b border-[var(--color-border)] flex justify-between">
              <span>{formatDate(order.created_at)}</span>
              <span className="flex items-center gap-1 font-medium">
                <Clock className="h-3.5 w-3.5" /> {formatTime(order.created_at)}
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-2 mb-4">
              <div className="flex justify-between text-[length:var(--text-xs)] text-[var(--color-text-muted)] font-semibold mb-1">
                <span>Qty</span> <span className="flex-1 ml-4">Items</span> <span>Price</span>
              </div>
              {order.items.map((item: BackendOrderItem, idx: number) => (
                <div key={idx} className="flex justify-between text-[length:var(--text-sm)] text-[var(--color-text-secondary)] font-medium">
                  <span className="text-[var(--color-text-muted)]">{String(item.quantity).padStart(2, "0")}</span>
                  <span className="flex-1 ml-4 truncate">{item.item_name}</span>
                  <span>₹{(Number(item.unit_price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mb-6 pt-4 border-t border-[var(--color-border)]">
              <span className="text-[var(--color-text-secondary)] font-medium">SubTotal</span>
              <span className="text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]">₹{Number(order.total_amount).toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-4 gap-3 mt-auto">
              <Button
                variant="outline"
                className="col-span-1 h-12 rounded-xl text-[var(--color-blue)] hover:text-[var(--color-blue-hover)] hover:border-[var(--color-blue-hover)] hover:bg-[var(--color-blue-subtle)]"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="danger" className="col-span-1 h-12 rounded-xl">
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="success" onClick={() => setShowTipModal(true)} className="col-span-2 h-12 rounded-xl">
                Pay Bill
              </Button>
            </div>
          </div>
        ))}
      </div>

      {showTipModal && (
        <div className="fixed inset-0 bg-[var(--color-bg-overlay)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-light border-0 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col items-center p-8 animate-fade-in-up relative shadow-xl">
            <button onClick={() => setShowTipModal(false)} className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>

            <h3 className="text-[var(--color-text-secondary)] font-semibold mb-4 text-[length:var(--text-base)]">Tips Amount</h3>
            <div className="text-5xl font-semibold text-[var(--color-text-primary)] mb-10 tracking-wider">{tipAmount}</div>

            <div className="grid grid-cols-3 gap-4 w-full px-4 mb-8">
              {pinPad.map((key) => (
                <button
                  key={key}
                  onClick={() => handlePinPress(key)}
                  className={`py-4 text-xl font-semibold rounded-xl transition-all ${
                    key === "x"
                      ? "bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)]"
                      : "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-green-subtle)] hover:text-[var(--color-accent-green)] border border-[var(--color-border)] shadow-sm"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            <div className="w-full flex justify-between items-center px-4">
              <button className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm font-semibold transition-colors">
                Print Receipt
              </button>
              <Button onClick={() => setShowTipModal(false)} variant="success" className="px-8 h-12 rounded-xl">
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
