"use client";

import { Briefcase, Calendar, Grid, Home, LayoutGrid, LogOut, Package, PieChart, Settings, ShoppingBag, Users, X } from "lucide-react";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/restaurant-admin" },
    { name: "Menu", icon: LayoutGrid, path: "/restaurant-admin/menu" },
    { name: "Tables", icon: Grid, path: "/restaurant-admin/table" },
    { name: "Staff", icon: Users, path: "/restaurant-admin/staff" },
    { name: "Inventory", icon: Package, path: "/restaurant-admin/inventory" },
    { name: "Reports", icon: PieChart, path: "/restaurant-admin/reports" },
    { name: "Order/Table", icon: ShoppingBag, path: "/restaurant-admin/orders" },
    { name: "Reservation", icon: Calendar, path: "/restaurant-admin/reservation" },
    { name: "Settings", icon: Settings, path: "/settings" },
    { name: "Franchise", icon: Briefcase, path: "/restaurant-admin/franschise" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[var(--color-bg-overlay)] z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] z-50 transform transition-transform duration-150 ease-in-out flex flex-col lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)] w-full mb-4">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Pinesphere</h2>
            <p className="text-[10px] font-semibold text-[var(--color-accent-green)] tracking-wider uppercase -mt-0.5">Admin Portal</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-full hover:bg-[var(--color-bg-tertiary)] transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4 w-4 text-[var(--color-text-secondary)]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {menuItems.map((item) => {
            // Check if active route (exact match or prefix)
            const isActive = pathname === item.path || (item.path !== "/restaurant-admin" && pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`relative flex items-center gap-4 p-4 rounded-xl transition-colors group ${
                  isActive
                    ? "bg-[var(--color-accent-green-subtle)] text-[var(--color-accent-green)] font-semibold"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <item.icon
                  className={`h-4 w-4 transition-colors ${
                    isActive ? "text-[var(--color-accent-green)]" : "text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-green)]"
                  }`}
                  strokeWidth={1.5}
                />
                <span
                  className={`font-medium ${
                    isActive ? "text-[var(--color-accent-green)]" : "text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-green)]"
                  }`}
                >
                  {item.name}
                </span>

                {/* Active Indicator line */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[var(--color-accent-green)] rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Exit Admin */}
        <div className="p-6 border-t border-[var(--color-border)] w-full">
          <Link
            href="/dashboard"
            className="flex items-center gap-4 p-4 rounded-xl text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] hover:text-[var(--color-danger-hover)] transition-colors group font-semibold"
          >
            <LogOut className="h-4 w-4 text-[var(--color-danger)]" strokeWidth={1.5} />
            <span>Exit Admin</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
