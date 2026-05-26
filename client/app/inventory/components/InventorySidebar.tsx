"use client";

import { AlertTriangle, ArrowLeftRight, ClipboardList, Package } from "lucide-react";
import Link from "next/link";

const iconProps = { className: "h-4 w-4", strokeWidth: 1.5 as const };

const menuItems = [
  { name: "Inventory", icon: <Package {...iconProps} />, path: "/inventory" },
  { name: "Purchase Orders", icon: <ClipboardList {...iconProps} />, path: "/inventory/purchase-orders" },
  { name: "Stock Transfer", icon: <ArrowLeftRight {...iconProps} />, path: "/inventory/stock-transfer" },
  { name: "Low Stock", icon: <AlertTriangle {...iconProps} />, path: "/inventory/low-stock" },
];

export default function InventorySidebar() {
  return (
    <aside className="hidden min-h-screen w-60 border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5 lg:block">
      <h1 className="mb-10 text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]">
        Inventory
      </h1>
      <div className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-[length:var(--text-sm)] text-[var(--color-text-secondary)] transition duration-150 hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </div>
    </aside>
  );
}
