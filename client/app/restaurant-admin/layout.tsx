"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "../components/restaurant-admin/AdminSidebar";
import Header from "../components/Header";
import { CartProvider } from "../components/dashboard/CartContext";
import { Toaster } from "react-hot-toast";
import authService from "../lib/authService";

const RESTAURANT_ROLES = ["ORGANIZATION_OWNER", "restaurant", "restaurant-admin"];

export default function RestaurantAdminLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 const router = useRouter();
 const pathname = usePathname();

 useEffect(() => {
    const isRestaurantAdmin = RESTAURANT_ROLES.includes(authService.getUserRole() || "");
  if (!authService.isAuthenticated() || !isRestaurantAdmin) {
   const next = pathname && pathname !== "/restaurant/login" ? `?next=${encodeURIComponent(pathname)}` : "";
   router.replace(`/restaurant/login${next}`);
  }
 }, [pathname, router]);

 const isRestaurantAdmin = authService.isAuthenticated() && RESTAURANT_ROLES.includes(authService.getUserRole() || "");

 if (!isRestaurantAdmin) {
  return null;
 }

 return (
  <CartProvider>
   <div className="flex min-h-screen bg-[var(--color-bg-primary)] font-sans text-[var(--color-text-primary)]">
    <Toaster
     position="top-right"
     toastOptions={{
      duration: 3000,
      style: {
       background: 'var(--color-bg-secondary)',
       color: 'var(--color-text-primary)',
       border: '1px solid var(--color-border)',
       borderRadius: 'var(--radius-lg)',
      },
     }}
    />
    
    <AdminSidebar 
     isOpen={isSidebarOpen} 
     onClose={() => setIsSidebarOpen(false)} 
    />
    
    <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
     <Header onMenuClick={() => setIsSidebarOpen(true)} />
     <main className="flex-1 overflow-x-hidden overflow-y-auto max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      {children}
     </main>
    </div>
   </div>
  </CartProvider>
 );
}
