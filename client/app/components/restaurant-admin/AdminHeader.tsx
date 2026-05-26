"use client";

import React from "react";
import { FiMenu, FiBell, FiSearch } from "react-icons/fi";
import { usePathname } from "next/navigation";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  
  // Format the path into a readable title
  const title = pathname === "/restaurant-admin" 
    ? "Dashboard" 
    : pathname.split("/").pop()?.charAt(0).toUpperCase() + pathname.split("/").pop()?.slice(1)!;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#252836] border-b border-gray-800 h-20 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <FiMenu size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">{title}</h1>
          <p className="text-sm text-gray-400">Tuesday, 2 Feb 2026</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-500 group-focus-within:text-[#ffb6c1] transition-colors" size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search for food, coffe, etc.." 
            className="w-64 bg-[#1f1d2b] border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-gray-300 focus:outline-none focus:border-[#ffb6c1] transition-all text-sm placeholder-gray-500"
          />
        </div>

        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <FiBell size={22} />
          <span className="absolute top-1 right-2 w-2 h-2 bg-[#ffb6c1] rounded-full border-2 border-[#252836]"></span>
        </button>

        <div className="flex items-center gap-3 border-l border-gray-700 pl-6 cursor-pointer group">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
            WJ
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">Watson Joyce</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
