"use client";

import React, { useState } from "react";
import KitchenSidebar from "../components/kitchen/KitchenSidebar";
import KitchenHeader from "../components/kitchen/KitchenHeader";
import { Toaster } from "react-hot-toast";

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 bg-pattern-light text-gray-800 flex font-sans">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#1e293b',
            border: '1px solid rgba(249, 115, 22, 0.2)',
            boxShadow: '0 8px 32px rgba(249, 115, 22, 0.15)'
          }
        }} 
      />
      
      <KitchenSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 md:ml-28">
        <KitchenHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 pb-24">
          {children}
        </main>
      </div>
    </div>
  );
}
