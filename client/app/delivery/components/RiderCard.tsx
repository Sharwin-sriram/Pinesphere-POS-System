"use client";

import { Rider } from "../types/delivery";
import RiderStatusBadge from "./RiderStatusBadge";

interface Props {
  rider: Rider;
}

export default function RiderCard({ rider }: Props) {
  return (
    <div className="card-light !p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-[var(--color-text-inverse)] font-semibold text-sm">
            {rider.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{rider.name}</h2>
            <p className="text-xs text-[var(--color-text-secondary)]">{rider.phone}</p>
          </div>
        </div>
        <RiderStatusBadge status={rider.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-3">
          <p className="text-[var(--color-text-muted)] text-xs font-medium">Vehicle</p>
          <p className="font-semibold text-[var(--color-text-primary)] mt-0.5">{rider.vehicle}</p>
        </div>
        <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-3">
          <p className="text-[var(--color-text-muted)] text-xs font-medium">Deliveries</p>
          <p className="font-semibold text-[var(--color-text-primary)] mt-0.5">{rider.deliveries}</p>
        </div>
        <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-3">
          <p className="text-[var(--color-text-muted)] text-xs font-medium">Earnings</p>
          <p className="font-semibold text-[var(--color-accent)] mt-0.5">₹{rider.earnings}</p>
        </div>
        <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-3">
          <p className="text-[var(--color-text-muted)] text-xs font-medium">Rating</p>
          <p className="font-semibold text-[var(--color-text-primary)] mt-0.5">⭐ {rider.rating}</p>
        </div>
      </div>
    </div>
  );
}