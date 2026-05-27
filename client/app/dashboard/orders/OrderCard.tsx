"use client";

import React from "react";
import {
  Clock,
  MapPin,
  Phone,
  User,
  ChevronRight,
  Utensils,
} from "lucide-react";
import { Order } from "./types";
import { STATUS_COLORS, STATUS_LABELS } from "./orderConfig";
import ProgressTracker from "./ProgressTracker";

interface OrderCardProps {
  order: Order;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}

function minutesUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.round(diff / 60_000));
}

export default function OrderCard({ order }: OrderCardProps) {
  const colors = STATUS_COLORS[order.status];
  const isActive = !["DELIVERED", "CANCELLED", "PAYMENT_FAILED", "REFUNDED"].includes(order.status);
  const eta = order.estimatedDelivery ? minutesUntil(order.estimatedDelivery) : null;

  return (
    <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)]">
            <Utensils className="h-4 w-4 text-[var(--color-accent)]" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
              {order.restaurantName}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {order.orderNumber} · {formatDate(order.placedAt)} at {formatTime(order.placedAt)}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text} ${colors.border}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* ── ETA banner (active orders only) ── */}
      {isActive && eta !== null && (
        <div className="flex items-center gap-2 bg-blue-50 border-b border-blue-100 px-5 py-2.5">
          <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" strokeWidth={1.75} />
          <p className="text-xs font-medium text-blue-700">
            {eta === 0
              ? "Arriving any moment now"
              : `Estimated delivery in ${eta} min · ${formatTime(order.estimatedDelivery!)}`}
          </p>
        </div>
      )}

      {/* ── Progress tracker ── */}
      <div className="px-5 py-6">
        <ProgressTracker status={order.status} />
      </div>

      {/* ── Items ── */}
      <div className="border-t border-[var(--color-border)] px-5 py-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          Items
        </p>
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-tertiary)] text-[10px] font-semibold text-[var(--color-text-secondary)]">
                  {item.quantity}
                </span>
                <span className="text-sm text-[var(--color-text-primary)] truncate">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-[var(--color-text-secondary)] shrink-0">
                ₹{(item.price * item.quantity).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>

        {/* Bill summary */}
        <div className="mt-4 space-y-1.5 border-t border-[var(--color-border)] pt-4">
          <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
            <span>Delivery fee</span>
            <span>₹{order.deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
            <span>Tax</span>
            <span>₹{order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold text-[var(--color-text-primary)] pt-1">
            <span>Total</span>
            <span>₹{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ── Delivery info ── */}
      <div className="border-t border-[var(--color-border)] px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-start gap-2.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-muted)]" strokeWidth={1.5} />
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-0.5">
              Delivery address
            </p>
            <p className="text-sm text-[var(--color-text-primary)]">{order.deliveryAddress}</p>
          </div>
        </div>

        {order.deliveryPartner && (
          <div className="flex items-start gap-2.5">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-muted)]" strokeWidth={1.5} />
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-0.5">
                Delivery partner
              </p>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {order.deliveryPartner.name}
              </p>
              <a
                href={`tel:${order.deliveryPartner.phone}`}
                className="mt-0.5 inline-flex items-center gap-1 text-xs text-[var(--color-blue)] hover:underline"
              >
                <Phone className="h-3 w-3" strokeWidth={1.5} />
                {order.deliveryPartner.phone}
              </a>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
