"use client";

import React from "react";
import { FiMenu, FiBell } from "react-icons/fi";
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
    <header className="sticky top-0 z-30 w-full glass-light border-b border-white/40 h-20 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-gray-700 hover:text-orange-600 rounded-lg hover:bg-white/60 transition-colors"
        >
          <FiMenu size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-wide">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-600 hover:text-orange-600 transition-colors">
          <FiBell size={22} />
        </button>

        <div className="flex items-center gap-3 border-l border-gray-200 pl-6 cursor-pointer group">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transition-all">
            KM
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">Kitchen Manager</p>
            <p className="text-xs text-gray-500">Main Kitchen</p>
          </div>
        </div>
      </div>
    </header>
  );
}
