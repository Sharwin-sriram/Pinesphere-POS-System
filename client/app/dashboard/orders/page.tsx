"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw, PackageSearch, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "../../lib/authService";
import { useOrdersList } from "./useOrderTracking";
import { Order, OrderStatus } from "./types";
import { STATUS_COLORS, STATUS_LABELS, FAILURE_STATUSES } from "./orderConfig";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isActiveOrder(status: OrderStatus) {
  return !FAILURE_STATUSES.includes(status) && status !== "DELIVERED";
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function OrderRowSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5 animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-10 w-10 rounded-lg bg-[var(--color-bg-tertiary)] shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-36 rounded bg-[var(--color-bg-tertiary)]" />
            <div className="h-3 w-52 rounded bg-[var(--color-bg-tertiary)]" />
          </div>
        </div>
        <div className="h-6 w-24 rounded-full bg-[var(--color-bg-tertiary)] shrink-0" />
      </div>
    </div>
  );
}

// ─── Order row card ───────────────────────────────────────────────────────────
function OrderRow({ order }: { order: Order }) {
  const colors  = STATUS_COLORS[order.status];
  const active  = isActiveOrder(order.status);
  const preview = order.items.slice(0, 2).map((i) => i.name).join(", ") +
    (order.items.length > 2 ? ` +${order.items.length - 2} more` : "");

  return (
    <Link
      href={`/dashboard/orders/${order.id}`}
      className="group block rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-border-hover)] hover:shadow-sm transition-all duration-200 overflow-hidden"
      aria-label={`View order ${order.orderNumber}`}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Restaurant icon */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-blue-600 text-white text-lg font-bold shadow-sm">
          {(order.restaurantName?.[0] ?? "R").toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
            {order.restaurantName}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
            {order.orderNumber} · {formatDate(order.placedAt)}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] truncate mt-1">
            {preview}
          </p>
        </div>

        {/* Right side */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold
              ${colors.bg} ${colors.text} ${colors.border}`}
          >
            {active && <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${colors.dot}`} />}
            {STATUS_LABELS[order.status]}
          </span>
          <span className="text-xs font-semibold text-[var(--color-text-primary)]">
            ₹{Number(order.total).toFixed(2)}
          </span>
        </div>

        <ChevronRight
          className="h-4 w-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)] shrink-0 transition-colors"
          strokeWidth={1.75}
        />
      </div>

      {/* Active order live banner */}
      {active && (
        <div className={`flex items-center gap-2 px-5 py-2 border-t border-[var(--color-border)] ${colors.bg}`}>
          <Clock className={`h-3.5 w-3.5 shrink-0 ${colors.text}`} strokeWidth={1.75} />
          <p className={`text-xs font-medium ${colors.text}`}>
            Live · Tap to track your order in real time
          </p>
        </div>
      )}
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const router       = useRouter();
  const [authorized, setAuthorized] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const role = authService.getUserRole();
    if (role && ["ORGANIZATION_OWNER", "restaurant", "restaurant-admin"].includes(role)) {
      setAuthorized(false);
      router.push("/restaurant-admin");
    }
    setAuthChecked(true);
  }, [router]);

  const { orders, loading, error, refetch } = useOrdersList(30_000);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[var(--color-text-secondary)]">Loading…</p>
      </div>
    );
  }

  if (!authorized) return null;

  const activeOrders   = orders.filter((o) => isActiveOrder(o.status));
  const pastOrders     = orders.filter((o) => !isActiveOrder(o.status));

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* ── Header ── */}
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
              My Orders
            </h1>
            <p className="text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
              {loading ? "Loading…" : `${orders.length} order${orders.length !== 1 ? "s" : ""} · auto-refreshes every 30s`}
            </p>
          </div>
        </div>

        <button
          id="orders-refresh-btn"
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] transition-smooth disabled:opacity-50"
          aria-label="Refresh orders"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.75} />
          Refresh
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && orders.length === 0 && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <OrderRowSkeleton key={i} />)}
        </div>
      )}

      {/* ── Active orders ── */}
      {!loading && activeOrders.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
            Active Orders
          </p>
          {activeOrders.map((o) => <OrderRow key={o.id} order={o} />)}
        </section>
      )}

      {/* ── Past orders ── */}
      {!loading && pastOrders.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
            Order History
          </p>
          {pastOrders.map((o) => <OrderRow key={o.id} order={o} />)}
        </section>
      )}

      {/* ── Empty ── */}
      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] py-16 text-center">
          <PackageSearch className="mb-4 h-10 w-10 text-[var(--color-text-muted)]" strokeWidth={1.25} />
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">No orders yet</p>
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
