"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiGrid, FiUsers, FiBox, FiPieChart, FiShoppingBag, FiCalendar, FiLogOut, FiX } from "react-icons/fi";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", icon: FiHome, path: "/restaurant-admin" },
    { name: "Menu", icon: FiGrid, path: "/restaurant-admin/menu" },
    { name: "Staff", icon: FiUsers, path: "/restaurant-admin/staff" },
    { name: "Inventory", icon: FiBox, path: "/restaurant-admin/inventory" },
    { name: "Reports", icon: FiPieChart, path: "/restaurant-admin/reports" },
    { name: "Order/Table", icon: FiShoppingBag, path: "/restaurant-admin/orders" },
    { name: "Reservation", icon: FiCalendar, path: "/restaurant-admin/reservation" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-28 flex flex-col items-center py-6 bg-[#1f1d2b] border-r border-gray-800 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Mobile Close Button */}
        <button className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white" onClick={onClose}>
          <FiX size={24} />
        </button>

        {/* Logo */}
        <div className="mb-8 font-bold text-[#ffb6c1] tracking-wider uppercase text-sm">
          COSYPOS
        </div>

        {/* Menu Items */}
        <nav className="flex-1 w-full flex flex-col gap-4 items-center overflow-y-auto custom-scrollbar-light">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.name} 
                href={item.path}
                onClick={() => { if(window.innerWidth < 1024) onClose(); }}
                className={`relative flex flex-col items-center justify-center w-20 py-3 rounded-2xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-[#ffb6c1] text-[#1f1d2b] shadow-[0_0_15px_rgba(255,182,193,0.4)]" 
                    : "text-gray-400 hover:text-[#ffb6c1]"
                }`}
              >
                <item.icon size={22} className="mb-2" />
                <span className="text-[10px] font-semibold tracking-wider text-center">{item.name}</span>
                
                {/* Active Indicator line on the left (Optional for extra styling) */}
                {isActive && (
                  <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-1 h-8 bg-[#ffb6c1] rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="mt-auto pt-6 w-full flex justify-center">
          <Link href="/dashboard" className="flex flex-col items-center justify-center w-20 py-3 text-gray-400 hover:text-red-400 transition-colors">
            <FiLogOut size={22} className="mb-2" />
            <span className="text-[10px] font-semibold tracking-wider">Logout</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
