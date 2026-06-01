"use client";

import { useEffect, useState } from "react";
import { deliveryApi } from "../services/delivery.service";

export default function ActiveOrdersTable() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await deliveryApi.getOrders();
        setOrders(data);
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  if (loading) {
    return <div className="p-5 text-center text-[var(--color-text-secondary)]">Loading orders...</div>;
  }

  return (
    <div className="card-light !p-5 overflow-x-auto">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Active Orders</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">Live order tracking across all riders</p>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-[var(--color-border)]">
            <th className="pb-3 text-[var(--color-text-muted)] font-medium">Order #</th>
            <th className="pb-3 text-[var(--color-text-muted)] font-medium">Customer</th>
            <th className="pb-3 text-[var(--color-text-muted)] font-medium">Status</th>
            <th className="pb-3 text-[var(--color-text-muted)] font-medium">Delivery</th>
            <th className="pb-3 text-[var(--color-text-muted)] font-medium">Rider</th>
            <th className="pb-3 text-[var(--color-text-muted)] font-medium">ETA</th>
            <th className="pb-3 text-[var(--color-text-muted)] font-medium">Amount</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
            >
              <td className="py-4 font-semibold text-[var(--color-text-primary)]">
                {order.order_details?.order_number || `#${order.order_id}`}
              </td>

              <td className="py-4 text-[var(--color-text-primary)]">
                {order.order_details?.customer_name || "Guest"}
              </td>

              <td className="py-4">
                <span className="bg-[var(--color-warning-subtle)] text-[var(--color-warning)] px-3 py-1 rounded-full text-xs font-semibold">
                  {order.status}
                </span>
              </td>

              <td className="py-4">
                <span className="bg-[var(--color-accent-subtle)] text-[var(--color-accent)] px-3 py-1 rounded-full text-xs font-semibold">
                  {order.status}
                </span>
              </td>

              <td className="py-4 text-[var(--color-text-secondary)]">
                {order.courier ? order.courier.name : "Unassigned"}
              </td>
              <td className="py-4 text-[var(--color-text-secondary)]">{order.eta || "-"}</td>
              <td className="py-4 font-semibold text-[var(--color-text-primary)]">
                ₹{order.order_details?.total_amount || "0"}
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={7} className="py-8 text-center text-[var(--color-text-muted)]">
                No active orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
