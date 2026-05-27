"use client";

import { Clock, LayoutGrid, List, LogOut, User, X } from "lucide-react";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";


interface WaiterSidebarProps {
 isOpen: boolean;
 onClose: () => void;
}

export default function WaiterSidebar({ isOpen, onClose }: WaiterSidebarProps) {
 const pathname = usePathname();

 const menuItems = [
 { name: "Tables", icon: LayoutGrid, path: "/waiter" },
 { name: "Current Orders", icon: List, path: "/waiter/orders" },
 { name: "History", icon: Clock, path: "/waiter/history" },
 { name: "Account", icon: User, path: "/waiter/account" },
 ];

 return (
 <>
  {/* Mobile Overlay */}
  {isOpen && (
    <div 
      className="fixed inset-0 bg-[var(--color-bg-overlay)] z-40 md:hidden transition-opacity"
      onClick={onClose}
    />
  )}

  {/* Sidebar */}
  <aside className={`fixed top-0 left-0 h-screen w-28 flex flex-col items-center py-6 glass-light border-r border-[var(--color-border)] z-50 transform transition-transform duration-150 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
    
    {/* Mobile Close Button */}
    <button className="md:hidden absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]" onClick={onClose}>
      <X className="h-4 w-4" strokeWidth={1.5} />
    </button>

    {/* Logo */}
    <div className="mb-8 font-semibold text-[var(--color-text-primary)] tracking-wider uppercase text-xs text-center px-2">
      WAITER
    </div>

    {/* Menu Items */}
    <nav className="flex-1 w-full flex flex-col gap-4 items-center overflow-y-auto custom-scrollbar-light">
      {menuItems.map((item) => {
        const isActive = pathname === item.path || (pathname.startsWith('/waiter/table/') && item.path === '/waiter');
        
        return (
          <Link 
            key={item.name} 
            href={item.path}
            onClick={() => { if(window.innerWidth < 768) onClose(); }}
            className={`relative flex flex-col items-center justify-center w-20 py-3 rounded-2xl transition-all duration-200 group ${
              isActive 
                ? "bg-[var(--color-accent)] text-[var(--color-text-inverse)] " 
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
            }`}
          >
            <item.icon size={22} className="mb-2" />
            <span className="text-[10px] font-semibold tracking-wider text-center">{item.name}</span>
            
            {isActive && (
              <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--color-accent)] rounded-r-full" />
            )}
          </Link>
        );
      })}
    </nav>

    {/* Logout */}
    <div className="mt-auto pt-6 w-full flex justify-center">
      <Link href="/dashboard" className="flex flex-col items-center justify-center w-20 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] rounded-2xl transition-colors">
        <LogOut className="h-4 w-4 mb-2" strokeWidth={1.5} />
        <span className="text-[10px] font-semibold tracking-wider">Logout</span>
      </Link>
    </div>
  </aside>
 </>
 );
}
