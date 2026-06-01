"use client";

import {
  Bike,
  PackageCheck,
  PackageX,
  Clock3,
} from "lucide-react";

const stats = [
  { title: "Active Deliveries",  value: "48",      icon: Bike,         color: "accent"  },
  { title: "Delivered Today",    value: "124",     icon: PackageCheck, color: "success" },
  { title: "Failed Deliveries",  value: "6",       icon: PackageX,     color: "danger"  },
  { title: "Avg Delivery Time",  value: "22 mins", icon: Clock3,       color: "accent"  },
];

const iconStyles: Record<string, string> = {
  accent:  "bg-[var(--color-accent-subtle)]  text-[var(--color-accent)]",
  success: "bg-[var(--color-success-subtle)] text-[var(--color-success)]",
  danger:  "bg-[var(--color-danger-subtle)]  text-[var(--color-danger)]",
};

export default function DeliveryStatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="card-light !p-5 flex justify-between items-center"
          >
            <div>
              <p className="text-[var(--color-text-secondary)] text-sm font-medium">
                {stat.title}
              </p>
              <h2 className="text-3xl font-bold mt-2 text-[var(--color-text-primary)]">
                {stat.value}
              </h2>
            </div>

            <div className={`p-3 rounded-xl ${iconStyles[stat.color]}`}>
              <Icon size={22} />
            </div>
          </div>
        );
      })}
    </div>
  );
}