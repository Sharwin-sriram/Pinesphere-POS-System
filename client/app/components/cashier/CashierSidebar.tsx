"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, LogOut, User, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CashierSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: { name: string; icon: LucideIcon; path: string }[] = [
  { name: "Bills", icon: LayoutGrid, path: "/cashier" },
  { name: "Account", icon: User, path: "/cashier/account" },
];

export default function CashierSidebar({ isOpen, onClose }: CashierSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen ? (
        <div className="fixed inset-0 z-40 bg-[var(--color-bg-overlay)] md:hidden" onClick={onClose} />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-16 flex-col items-center border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] py-6 transition-transform duration-150 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          className="absolute right-2 top-4 text-[var(--color-text-muted)] md:hidden"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <div className="mb-8 px-2 text-center text-[length:var(--text-2xs)] font-medium uppercase tracking-widest text-[var(--color-text-muted)]">
          Cashier
        </div>

        <nav className="flex w-full flex-1 flex-col items-center gap-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.path || (pathname?.startsWith("/cashier/bill/") && item.path === "/cashier");
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => {
                  if (window.innerWidth < 768) onClose();
                }}
                className={`relative flex w-14 flex-col items-center justify-center rounded-md py-3 transition duration-150 ${
                  isActive
                    ? "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <Icon className="mb-1 h-5 w-5" strokeWidth={1.5} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/dashboard"
          className="flex w-14 flex-col items-center rounded-md py-3 text-[var(--color-text-secondary)] transition duration-150 hover:bg-[var(--color-danger-subtle)] hover:text-[var(--color-danger)]"
        >
          <LogOut className="mb-1 h-5 w-5" strokeWidth={1.5} />
          <span className="text-[10px] font-medium">Logout</span>
        </Link>
      </aside>
    </>
  );
}
