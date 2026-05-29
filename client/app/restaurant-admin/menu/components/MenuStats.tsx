"use client";

import React, { useMemo } from "react";
import { CheckCircle2, Database, AlertCircle, Tag } from "lucide-react";
import { MenuItem, Category } from "../types";

interface MenuStatsProps {
  items: MenuItem[];
  categories: Category[];
}

export default function MenuStats({ items, categories }: MenuStatsProps) {
  // Memoize calculations to prevent heavy calculations on list rerenders
  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((i) => i.status === "Active").length;
    const outOfStock = items.filter((i) => i.status === "Out of Stock" || i.quantity <= 0).length;
    const totalCats = categories.length;

    return [
      {
        title: "Total Items",
        value: total,
        icon: Database,
        color: "text-[var(--color-blue)]",
        bg: "bg-[var(--color-blue-subtle)]",
        desc: "All dishes registered",
      },
      {
        title: "Active Items",
        value: active,
        icon: CheckCircle2,
        color: "text-[var(--color-success)]",
        bg: "bg-[var(--color-success-subtle)]",
        desc: "Visible to customers",
      },
      {
        title: "Out of Stock",
        value: outOfStock,
        icon: AlertCircle,
        color: "text-[var(--color-danger)]",
        bg: "bg-[var(--color-danger-subtle)]",
        desc: "Requires replenishment",
      },
      {
        title: "Total Categories",
        value: totalCats,
        icon: Tag,
        color: "text-[var(--color-accent)]",
        bg: "bg-[var(--color-accent-subtle)]",
        desc: "Structured item groups",
      },
    ];
  }, [items, categories]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
      {stats.map((stat, idx) => (
        <div key={idx} className="card-light !p-6 flex flex-col justify-between transition-smooth hover:-translate-y-0.5">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon size={22} strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[var(--color-text-secondary)] text-[length:var(--text-sm)] font-medium truncate">
                {stat.title}
              </h3>
              <p className="text-[length:var(--text-2xl)] font-semibold text-[var(--color-text-primary)] mt-1.5 leading-none">
                {stat.value}
              </p>
            </div>
          </div>
          <div className="mt-4 border-t border-[var(--color-border)] pt-3 text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium leading-none">
            {stat.desc}
          </div>
        </div>
      ))}
    </div>
  );
}
