"use client";

import { Route } from "lucide-react";

export default function RouteOptimizationPanel() {
  return (
    <div className="card-light !p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Route Optimization</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Best routes for riders</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
          <Route size={20} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl p-4">
          <p className="font-semibold text-[var(--color-text-primary)] text-sm">Suggested Route</p>
          <p className="text-[var(--color-text-secondary)] text-xs mt-1">RS Puram → Gandhipuram → Peelamedu</p>
        </div>

        <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl p-4">
          <p className="font-semibold text-[var(--color-text-primary)] text-sm">Estimated Distance</p>
          <p className="text-[var(--color-accent)] text-xs font-semibold mt-1">12.4 KM</p>
        </div>

        <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl p-4">
          <p className="font-semibold text-[var(--color-text-primary)] text-sm">Estimated Time</p>
          <p className="text-[var(--color-accent)] text-xs font-semibold mt-1">34 Minutes</p>
        </div>
      </div>
    </div>
  );
}