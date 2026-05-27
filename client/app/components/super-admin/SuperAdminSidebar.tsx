"use client";

import { Briefcase, Home, LogOut, Settings, Shield, User, Users, X } from "lucide-react";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";


interface SuperAdminSidebarProps {
 isOpen: boolean;
 onClose: () => void;
}

export default function SuperAdminSidebar({ isOpen, onClose }: SuperAdminSidebarProps) {
 const pathname = usePathname();

 const menuItems = [
 { name: "Dashboard", icon: Home, path: "/super-admin" },
 { name: "Users", icon: Users, path: "/super-admin/users" },
 { name: "Restaurants", icon: Briefcase, path: "/super-admin/restaurants" },
 { name: "Staff", icon: Shield, path: "/super-admin/staff" },
 { name: "Settings", icon: Settings, path: "/super-admin/settings" },
 ];

 return (
 <>
 {/* Mobile Overlay */}
 {isOpen && (
 <div 
 className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden transition-opacity"
 onClick={onClose}
 />
 )}

 {/* Sidebar */}
 <aside className={`fixed top-0 left-0 h-screen w-28 flex flex-col items-center py-6 glass-light border-r border-white/50 z-50 transform transition-transform duration-150 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
 
 {/* Mobile Close Button */}
 <button className="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-[var(--color-text-primary)]" onClick={onClose}>
 <X className="h-4 w-4" strokeWidth={1.5} />
 </button>

 {/* Logo */}
 <div className="mb-8 font-semibold gradient-text-light tracking-wider uppercase text-xs text-center px-2">
 SUPER ADMIN
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
 ? "bg-gradient-to-tr from-blue-500 to-cyan-400 text-white " 
 : "text-gray-500 hover:text-blue-600 hover:bg-blue-50/50"
 }`}
 >
 <item.icon size={22} className="mb-2" />
 <span className="text-[10px] font-semibold tracking-wider text-center">{item.name}</span>
 
 {isActive && (
 <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
 )}
 </Link>
 );
 })}
 </nav>

 {/* Logout */}
 <div className="mt-auto pt-6 w-full flex justify-center">
 <Link href="/dashboard" className="flex flex-col items-center justify-center w-20 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50/50 rounded-2xl transition-colors">
 <LogOut className="h-4 w-4 mb-2" strokeWidth={1.5} />
 <span className="text-[10px] font-semibold tracking-wider">Logout</span>
 </Link>
 </div>
 </aside>
 </>
 );
}
