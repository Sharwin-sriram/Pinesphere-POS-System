"use client";

import React, { useState } from "react";
import Topbar from "../components/dashboard/Topbar";
import Sidebar from "../components/dashboard/Sidebar";
import { CartProvider } from "../components/dashboard/CartContext";
import { Toaster } from "react-hot-toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50 bg-pattern-light">
        <Toaster position="top-center" reverseOrder={false} />
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </CartProvider>
  );
}
