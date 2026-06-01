"use client";

import { useParams } from "next/navigation";

export default function RiderDetailsPage() {
  const params = useParams();

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="card-light !p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-[var(--color-text-inverse)] font-bold text-xl">
            R
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Rider Details</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">Rider ID: {params.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl p-5">
            <p className="text-sm text-[var(--color-text-secondary)] font-medium">Total Deliveries</p>
            <h2 className="text-3xl font-bold mt-2 text-[var(--color-text-primary)]">124</h2>
          </div>

          <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl p-5">
            <p className="text-sm text-[var(--color-text-secondary)] font-medium">Earnings</p>
            <h2 className="text-3xl font-bold mt-2 text-[var(--color-accent)]">₹42,000</h2>
          </div>

          <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl p-5">
            <p className="text-sm text-[var(--color-text-secondary)] font-medium">Rating</p>
            <h2 className="text-3xl font-bold mt-2 text-[var(--color-text-primary)]">⭐ 4.8</h2>
          </div>
        </div>
      </div>
    </div>
  );
}