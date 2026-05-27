"use client";

import React, { useState } from "react";
import Header from "../components/Header";
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
 <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
 <Toaster
 position="top-center"
 reverseOrder={false}
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
 <Sidebar 
 isOpen={isSidebarOpen} 
 onClose={() => setIsSidebarOpen(false)} 
 />
 
 <Header onMenuClick={() => setIsSidebarOpen(true)} />
 
 <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
 {children}
 </main>
 </div>
 </CartProvider>
 );
}
