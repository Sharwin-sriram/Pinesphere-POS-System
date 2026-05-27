"use client";

import { FiBell, FiMenu } from "react-icons/fi";
import React from "react";

import { usePathname } from "next/navigation";

interface WaiterHeaderProps {
 onMenuClick: () => void;
}

export default function WaiterHeader({ onMenuClick }: WaiterHeaderProps) {
 const pathname = usePathname();
 
 let title = "Waiter Dashboard";
 if (pathname.includes("/waiter/table/")) {
 title = `Table ${pathname.split("/").pop()}`;
 } else if (pathname === "/waiter/orders") {
 title = "Current Orders";
 } else if (pathname === "/waiter/account") {
 title = "My Account";
 } else if (pathname === "/waiter") {
 title = "Select Table";
 }

  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] h-20 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
        >
          <FiMenu size={24} />
        </button>
 <div>
 <h1 className="text-xl font-semibold text-[var(--color-text-primary)] tracking-wide">{title}</h1>
 </div>
 </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors">
          <FiBell size={22} />
          <span className="absolute top-1 right-2 w-2 h-2 bg-[var(--color-danger)] rounded-full border-2 border-[var(--color-bg-secondary)]"></span>
        </button>

        <div className="flex items-center gap-3 border-l border-[var(--color-border)] pl-6 cursor-pointer group">
          <div className="h-10 w-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-[var(--color-text-inverse)] font-semibold hover: transition-all">
            JW
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">John Waiter</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Active Shift</p>
          </div>
        </div>
      </div>
    </header>
  );
}
