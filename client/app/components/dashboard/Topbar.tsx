"use client";

import { Bell, ChevronDown, Menu, Package, Search, ShoppingCart, User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { useCart } from "./CartContext";
import authService from "../../lib/authService";

interface TopbarProps {
 onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
 const { cartCount } = useCart();
 const [open, setOpen] = useState(false);
 const [authed, setAuthed] = useState(false);
 const [user, setUser] = useState<ReturnType<typeof authService.getCurrentUser>>(null);
 const buttonRef = useRef<HTMLButtonElement | null>(null);
 const menuRef = useRef<HTMLDivElement | null>(null);

 // Populate auth state client-side only to avoid SSR/client hydration mismatch
 useEffect(() => {
  setAuthed(authService.isAuthenticated());
  setUser(authService.getCurrentUser());
 }, []);

 const avatarUrl =
  user?.profile_image ||
  user?.avatar ||
  user?.image ||
  user?.picture ||
  null;
 const initial = (user?.name?.[0] || "U").toUpperCase();

 useEffect(() => {
  const onClick = (e: MouseEvent) => {
   const target = e.target as Node | null;
   if (!target) return;
   if (menuRef.current?.contains(target)) return;
   if (buttonRef.current?.contains(target)) return;
   setOpen(false);
  };
  document.addEventListener("mousedown", onClick);
  return () => document.removeEventListener("mousedown", onClick);
 }, []);

 const profileLabel = authed ? "Profile menu" : "Login";

 return (
 <header className="sticky top-0 z-30 w-full glass-light border-b border-white/40">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">

 {/* Left Side: Menu + Cart + Profile (cart first section) */}
 <div className="flex items-center gap-2">
 <button
 onClick={onMenuClick}
 className="p-2 bg-white/60 hover:bg-white rounded-xl transition-all text-gray-700 lg:hidden"
 aria-label="Open menu"
 >
 <Menu className="h-4 w-4" strokeWidth={1.5} />
 </button>

 <Link
 href="/dashboard/cart"
 className="relative p-2 bg-[var(--color-blue)] text-white rounded-ds-lg hover:-translate-y-0.5 transition-smooth"
 aria-label="My cart"
 >
 <ShoppingCart className="h-4 w-4" strokeWidth={1.5} />
 {cartCount > 0 && (
 <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full border-2 border-white animate-bounce-light">
 {cartCount}
 </span>
 )}
 </Link>

 {authed ? (
 <div className="relative">
 <button
 ref={buttonRef}
 onClick={() => setOpen((v) => !v)}
 className="flex items-center gap-2 p-2 bg-white/60 hover:bg-white rounded-xl transition-all text-gray-700"
 aria-haspopup="menu"
 aria-expanded={open}
 aria-label={profileLabel}
 >
 {avatarUrl ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img src={avatarUrl} alt="Profile" className="h-7 w-7 rounded-full object-cover" />
 ) : (
 <span className="h-7 w-7 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-xs">
 {initial}
 </span>
 )}
 <ChevronDown className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
 </button>

 {open && (
 <div
 ref={menuRef}
 role="menu"
 className="absolute left-0 mt-2 w-44 rounded-xl border border-white/60 bg-white/95 backdrop-blur-md shadow-sm p-2 z-50"
 >
 <Link href="/dashboard/account" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-blue-50" role="menuitem">
 <User className="h-4 w-4" strokeWidth={1.5} />
 Account
 </Link>
 <Link href="/dashboard/orders" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-blue-50" role="menuitem">
 <Package className="h-4 w-4" strokeWidth={1.5} />
 My Orders
 </Link>
 <Link href="/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-blue-50" role="menuitem">
 Settings
 </Link>
 <button
 onClick={() => authService.logout()}
 className="w-full text-left flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
 role="menuitem"
 >
 Logout
 </button>
 </div>
 )}
 </div>
 ) : (
 <Link
 href="/login"
 className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 hover:bg-white text-gray-700 transition-all font-medium"
 >
 Login
 </Link>
 )}
 </div>

 {/* Center: Global Search */}
 <div className="hidden sm:flex flex-1 max-w-2xl ml-4">
 <div className="relative group w-full">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <Search className="text-gray-400 group-focus-within:text-blue-500 transition-colors h-4 w-4" strokeWidth={1.5} />
 </div>
 <input 
 type="text" 
 placeholder="Search for restaurants, cuisines, or dishes..." 
 className="w-full bg-white/70 border border-white/60 rounded-2xl pl-12 pr-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all "
 />
 </div>
 </div>

 {/* Right Side: Notifications */}
 <div className="flex items-center gap-3">
 <button
 className="p-2 bg-white/60 hover:bg-white rounded-xl transition-all text-gray-700"
 aria-label="Notifications"
 >
 <Bell className="h-4 w-4" strokeWidth={1.5} />
 </button>
 </div>
 </div>
 </header>
 );
}
