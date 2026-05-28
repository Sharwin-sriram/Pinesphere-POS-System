"use client";

import { Home, Package, Search, Settings, User, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { authService } from "../../lib/authService";

interface SidebarProps {
 isOpen: boolean;
 onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
 const [userRole, setUserRole] = useState<string | null>(null);

 useEffect(() => {
   const role = authService.getUserRole();
   setUserRole(role);
 }, []);

 // Check if user is a restaurant role
 const isRestaurantRole = userRole && ["ORGANIZATION_OWNER", "restaurant", "restaurant-admin"].includes(userRole);
 return (
 <>
  {/* Overlay */}
  {isOpen && (
    <div 
      className="fixed inset-0 bg-[var(--color-bg-overlay)] z-40 transition-opacity"
      onClick={onClose}
    />
  )}

  {/* Sidebar Drawer */}
  <div 
    className={`fixed top-0 left-0 h-full w-72 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] z-50 transform transition-transform duration-150 ease-in-out flex flex-col ${
      isOpen ? "translate-x-0" : "-translate-x-full"
    }`}
  >
    <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Pinesphere</h2>
      <button 
        onClick={onClose}
        className="p-2 rounded-full hover:bg-[var(--color-bg-tertiary)] transition-colors"
      >
        <X className="h-4 w-4 text-[var(--color-text-secondary)]" strokeWidth={1.5} />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
      {/* Menu Items */}
      <Link href="/dashboard" onClick={onClose} className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--color-bg-tertiary)] transition-colors group">
        <Home className="h-4 w-4 text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)]" strokeWidth={1.5} />
        <span className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)]">Home</span>
      </Link>
      
      <Link href="/dashboard/restaurants" onClick={onClose} className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--color-bg-tertiary)] transition-colors group">
        <Search className="h-4 w-4 text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)]" strokeWidth={1.5} />
        <span className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)]">Search Restaurants</span>
      </Link>

      {/* Hide "My Orders" for restaurant roles */}
      {!isRestaurantRole && (
        <Link href="/dashboard/orders" onClick={onClose} className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--color-bg-tertiary)] transition-colors group">
          <Package className="h-4 w-4 text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)]" strokeWidth={1.5} />
          <span className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)]">My Orders</span>
        </Link>
      )}

      <Link href="/account" onClick={onClose} className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--color-bg-tertiary)] transition-colors group">
        <User className="h-4 w-4 text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)]" strokeWidth={1.5} />
        <span className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)]">My Account</span>
      </Link>

      <Link href="/settings" onClick={onClose} className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--color-bg-tertiary)] transition-colors group">
        <Settings className="h-4 w-4 text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)]" strokeWidth={1.5} />
        <span className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)]">Account Settings</span>
      </Link>
    </div>
 
    <div className="p-6 border-t border-[var(--color-border)]">
      <button className="w-full btn-secondary-light text-[var(--color-danger)] hover:text-[var(--color-danger-hover)] hover:bg-[var(--color-danger-subtle)] border-[var(--color-danger-subtle)] font-semibold">
        Logout
      </button>
    </div>
  </div>
 </>
 );
}
