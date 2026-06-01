"use client";

import { TrendingUp } from "lucide-react";

export default function EarningsCard() {
  return (
    <div className="card-light !p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Delivery Earnings</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Today's summary</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
          <TrendingUp size={20} />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[var(--color-text-secondary)] text-sm font-medium">
            Today's Earnings
          </p>
          <h1 className="text-4xl font-bold mt-1 text-[var(--color-text-primary)]">
            ₹18,420
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl p-4">
            <p className="text-sm text-[var(--color-text-secondary)] font-medium">
              Riders Paid
            </p>
            <h3 className="text-2xl font-bold mt-1 text-[var(--color-text-primary)]">
              ₹12,200
            </h3>
          </div>

          <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl p-4">
            <p className="text-sm text-[var(--color-text-secondary)] font-medium">
              Pending
            </p>
            <h3 className="text-2xl font-bold mt-1 text-[var(--color-accent)]">
              ₹6,220
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}