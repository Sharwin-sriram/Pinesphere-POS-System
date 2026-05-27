"use client";

import { Bell, Menu } from "lucide-react";
import React from "react";

import { usePathname } from "next/navigation";

interface KitchenHeaderProps {
 onMenuClick: () => void;
}

export default function KitchenHeader({ onMenuClick }: KitchenHeaderProps) {
 const pathname = usePathname();
 
 let title = "Kitchen Dashboard";
 if (pathname === "/kitchen/account") {
 title = "My Account";
 } else if (pathname === "/kitchen") {
 title = "Active Orders";
 }

 return (
    <header className="sticky top-0 z-30 w-full bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] h-20 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
        >
          <Menu className="h-4 w-4" strokeWidth={1.5} />
        </button>
 <div>
 <h1 className="text-xl font-semibold text-[var(--color-text-primary)] tracking-wide">{title}</h1>
 </div>
 </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors">
          <Bell className="h-4 w-4" strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-3 border-l border-[var(--color-border)] pl-6 cursor-pointer group">
          <div className="h-10 w-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-[var(--color-text-inverse)] font-semibold hover: transition-all">
            KM
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">Kitchen Manager</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Main Kitchen</p>
          </div>
        </div>
      </div>
    </header>
  );
}
