"use client";

import React, { useState } from "react";
import WaiterSidebar from "../components/waiter/WaiterSidebar";
import WaiterHeader from "../components/waiter/WaiterHeader";
import { Toaster } from "react-hot-toast";

export default function WaiterLayout({
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
            border: '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)'
          }
        }} 
      />
      
      <WaiterSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 md:ml-28">
        <WaiterHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 pb-24">
          {children}
        </main>
      </div>
    </div>
  );
}
