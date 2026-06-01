"use client";

import { MapPin } from "lucide-react";

export default function DeliveryMap() {
  return (
    <div className="card-light !p-5 h-[350px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Live Delivery Tracking</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Real-time rider locations</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
          <MapPin size={20} />
        </div>
      </div>

      <div className="flex-1 w-full rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl">🗺️</span>
          <p className="text-[var(--color-text-secondary)] font-medium mt-2 text-sm">
            Google Maps Integration
          </p>
          <p className="text-[var(--color-text-muted)] text-xs mt-1">Live rider tracking will appear here</p>
        </div>
      </div>
    </div>
  );
}