"use client";

import { Bell, Search, Menu } from "lucide-react";
import React from "react";
import { usePathname } from "next/navigation";

interface DeliveryTopbarProps {
  onMenuClick?: () => void;
}

export default function DeliveryTopbar({ onMenuClick }: DeliveryTopbarProps) {
  const pathname = usePathname();
  
  let title = "Delivery Dashboard";
  if (pathname.includes("/active-orders")) title = "Active Orders";
  else if (pathname.includes("/riders")) title = "Riders";
  else if (pathname.includes("/tracking")) title = "Tracking";
  else if (pathname.includes("/analytics")) title = "Analytics";

  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] h-20 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
          >
            <Menu size={24} />
          </button>
        )}
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)] tracking-wide">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-3 bg-[var(--color-bg-tertiary)] px-4 py-2 border border-[var(--color-border)] rounded-xl w-[250px] focus-within:border-[var(--color-accent)] transition-colors">
          <Search size={18} className="text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search deliveries..."
            className="bg-transparent outline-none w-full text-sm text-[var(--color-text-primary)]"
          />
        </div>

        <button className="relative p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors">
          <Bell size={22} />
          <span className="absolute top-1 right-2 w-2 h-2 bg-[var(--color-danger)] rounded-full border-2 border-[var(--color-bg-secondary)]"></span>
        </button>

        <div className="flex items-center gap-3 border-l border-[var(--color-border)] pl-6 cursor-pointer group">
          <div className="h-10 w-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-[var(--color-text-inverse)] font-semibold hover: transition-all">
            AD
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">Admin User</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Delivery Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
}