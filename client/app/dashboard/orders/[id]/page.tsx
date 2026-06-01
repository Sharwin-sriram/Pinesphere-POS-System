"use client";

import React, { use, useEffect, useState } from "react";
import { ArrowLeft, RefreshCw, PackageSearch } from "lucide-react";
import Link from "next/link";
import { useOrderTracking } from "../useOrderTracking";
import OrderCard from "../OrderCard";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function OrderSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden animate-pulse">
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
export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { order, loading, error, refetch } = useOrderTracking({
    orderId: id,
    pollInterval: 20_000,
  });

  // Track last-refreshed timestamp for UI feedback
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  useEffect(() => {
    if (!loading) setLastRefreshed(new Date());
  }, [loading]);

  const formattedTime = lastRefreshed.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] transition-smooth"
            aria-label="Back to orders"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className="text-[length:var(--text-xl)] font-semibold text-[var(--color-text-primary)]">
              Track Order
            </h1>
            <p className="text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
              Live status · refreshed at {formattedTime}
            </p>
          </div>
        </div>

        <button
          id="order-detail-refresh-btn"
          onClick={() => { refetch(); setLastRefreshed(new Date()); }}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] transition-smooth disabled:opacity-50"
          aria-label="Refresh order status"
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

      {/* ── Skeleton ── */}
      {loading && !order && <OrderSkeleton />}

      {/* ── Order card ── */}
      {order && <OrderCard order={order} />}

      {/* ── Not found ── */}
      {!loading && !error && !order && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] py-16 text-center">
          <PackageSearch className="mb-4 h-10 w-10 text-[var(--color-text-muted)]" strokeWidth={1.25} />
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Order not found</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            This order may not exist or you don't have access to it.
          </p>
          <Link
            href="/dashboard/orders"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] transition-smooth"
          >
            Back to my orders
          </Link>
        </div>
      )}
    </div>
  );
}
