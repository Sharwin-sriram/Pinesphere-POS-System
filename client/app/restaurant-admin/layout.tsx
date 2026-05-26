"use client";

import React, { useState } from "react";
import AdminSidebar from "../components/restaurant-admin/AdminSidebar";
import AdminHeader from "../components/restaurant-admin/AdminHeader";
import { Toaster } from "react-hot-toast";

export default function RestaurantAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#1f1d2b] text-white flex font-sans">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#252836',
            color: '#fff',
            border: '1px solid #374151',
          }
        }} 
      />
      
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-28">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#1f1d2b] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
