"use client";

const timeline = [
  "Order Received",
  "Preparing",
  "Picked Up",
  "Out for Delivery",
  "Delivered",
];

export default function DeliveryTimeline() {
  return (
    <div className="card-light !p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Delivery Timeline</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">Order progress steps</p>
      </div>

      <div className="space-y-4">
        {timeline.map((item, index) => (
          <div key={item} className="flex items-center gap-4">
            <div className="relative flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-[var(--color-accent)]" />
              {index < timeline.length - 1 && (
                <div className="w-0.5 h-6 bg-[var(--color-border)] mt-1" />
              )}
            </div>
            <div className="pb-2">
              <p className="font-medium text-[var(--color-text-primary)]">{item}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Step {index + 1}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}