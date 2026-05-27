"use client";

import React, { useState } from "react";
import { ArrowLeft, RefreshCw, PackageSearch } from "lucide-react";
import Link from "next/link";
import { useOrderTracking } from "./useOrderTracking";
import OrderCard from "./OrderCard";
import { OrderStatus } from "./types";
import { STATUS_COLORS, STATUS_LABELS } from "./orderConfig";

// ─── Demo: cycle through statuses to preview the tracker ─────────────────────
const DEMO_STATUSES: OrderStatus[] = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "PAYMENT_FAILED",
  "REFUNDED",
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function OrderSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden animate-shimmer">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)]">
        <div className="h-10 w-10 rounded-lg bg-[var(--color-bg-tertiary)]" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-40 rounded bg-[var(--color-bg-tertiary)]" />
          <div className="h-3 w-56 rounded bg-[var(--color-bg-tertiary)]" />
        </div>
        <div className="h-6 w-24 rounded-full bg-[var(--color-bg-tertiary)]" />
      </div>
      <div className="px-5 py-8 flex items-center justify-between gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-[var(--color-bg-tertiary)]" />
              <div className="h-3 w-16 rounded bg-[var(--color-bg-tertiary)]" />
            </div>
            {i < 5 && <div className="h-0.5 flex-1 rounded bg-[var(--color-bg-tertiary)]" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  // In production, get orderId from URL params or user session
  const orderId = "demo-order-001";

  const { order, loading, error, refetch } = useOrderTracking({
    orderId,
    // wsUrl: `ws://localhost:8000/ws/orders/${orderId}/`,  // uncomment for real WS
  });

  // Demo status override for previewing all states
  const [demoStatus, setDemoStatus] = useState<OrderStatus | null>(null);
  const displayOrder = order && demoStatus ? { ...order, status: demoStatus } : order;

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] transition-smooth"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className="text-[length:var(--text-xl)] font-semibold text-[var(--color-text-primary)]">
              Track Order
            </h1>
            <p className="text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
              Live order status and delivery updates
            </p>
          </div>
        </div>

        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] transition-smooth disabled:opacity-50"
          aria-label="Refresh order status"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.75} />
          Refresh
        </button>
      </div>

      {/* ── Demo status switcher (remove in production) ── */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          Preview status (demo only)
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDemoStatus(null)}
            className={[
              "rounded-full border px-3 py-1 text-xs font-medium transition-smooth",
              demoStatus === null
                ? "border-[var(--color-blue)] bg-blue-50 text-[var(--color-blue)]"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]",
            ].join(" ")}
          >
            Live
          </button>
          {DEMO_STATUSES.map((s) => {
            const c = STATUS_COLORS[s];
            const active = demoStatus === s;
            return (
              <button
                key={s}
                onClick={() => setDemoStatus(s)}
                className={[
                  "rounded-full border px-3 py-1 text-xs font-medium transition-smooth",
                  active
                    ? `${c.bg} ${c.text} ${c.border}`
                    : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]",
                ].join(" ")}
              >
                {STATUS_LABELS[s]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && !displayOrder && <OrderSkeleton />}

      {/* ── Order card ── */}
      {displayOrder && <OrderCard order={displayOrder} />}

      {/* ── Empty state ── */}
      {!loading && !error && !displayOrder && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] py-16 text-center">
          <PackageSearch className="mb-4 h-10 w-10 text-[var(--color-text-muted)]" strokeWidth={1.25} />
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">No active orders</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Your order history will appear here once you place an order.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] transition-smooth"
          >
            Browse restaurants
          </Link>
        </div>
      )}
    </div>
  );
}
