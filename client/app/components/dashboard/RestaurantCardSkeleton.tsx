"use client";

export default function RestaurantCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="h-40 w-full animate-pulse bg-[var(--color-bg-tertiary)]" />
      <div className="p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--color-bg-tertiary)]" />
        <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-[var(--color-bg-tertiary)]" />
        <div className="mt-4 flex gap-2">
          <div className="h-3 w-20 animate-pulse rounded bg-[var(--color-bg-tertiary)]" />
          <div className="h-3 w-24 animate-pulse rounded bg-[var(--color-bg-tertiary)]" />
          <div className="h-3 w-16 animate-pulse rounded bg-[var(--color-bg-tertiary)]" />
        </div>
      </div>
    </div>
  );
}

