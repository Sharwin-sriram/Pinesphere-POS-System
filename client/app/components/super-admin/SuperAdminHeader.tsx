"use client";

import { Bell, Menu, Search } from "lucide-react";
import React from "react";

import { usePathname } from "next/navigation";

interface SuperAdminHeaderProps {
 onMenuClick: () => void;
}

export default function SuperAdminHeader({ onMenuClick }: SuperAdminHeaderProps) {
 const pathname = usePathname();

 const pageKey = pathname.split("/").pop() ?? "";
 const title =
   pathname === "/super-admin"
     ? "Subscription & Billing"
     : pageKey.charAt(0).toUpperCase() + pageKey.slice(1);
 const subtitle = pathname === "/super-admin" ? "SaaS Revenue Console" : "Global Overview";

 return (
 <header className="sticky top-0 z-30 w-full glass-light border-b border-white/40 h-20 flex items-center justify-between px-6">
 <div className="flex items-center gap-4">
 <button 
 onClick={onMenuClick}
 className="lg:hidden p-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-white/60 transition-colors"
 >
 <Menu className="h-4 w-4" strokeWidth={1.5} />
 </button>
 <div>
 <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] tracking-wide">{title}</h1>
 <p className="text-sm text-gray-500">{subtitle}</p>
 </div>
 </div>

 <div className="flex items-center gap-6">
 <div className="hidden md:flex relative group">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <Search className="text-gray-400 group-focus-within:text-blue-500 transition-colors h-4 w-4" strokeWidth={1.5} />
 </div>
 <input 
 type="text" 
 placeholder="Search platform..." 
 className="w-64 bg-white/70 border border-white/60 rounded-xl pl-10 pr-4 py-2.5 text-[var(--color-text-primary)] focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm placeholder-gray-400 "
 />
 </div>

 <button className="relative p-2 text-[var(--color-text-secondary)] hover:text-blue-600 transition-colors">
 <Bell className="h-4 w-4" strokeWidth={1.5} />
 <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
 </button>

 <div className="flex items-center gap-3 border-l border-gray-200 pl-6 cursor-pointer group">
 <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white font-semibold hover: transition-all border border-gray-700">
 SA
 </div>
 <div className="hidden md:block">
 <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Super Admin</p>
 <p className="text-xs text-gray-500">System Owner</p>
 </div>
 </div>
 </div>
 </header>
 );
}
