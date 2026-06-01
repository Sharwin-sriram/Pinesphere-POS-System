"use client";

import React, { useState } from "react";
import DeliverySidebar from "./components/DeliverySidebar";
import DeliveryTopbar from "./components/DeliveryTopbar";
import { Toaster } from "react-hot-toast";

export default function DeliveryLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const [isSidebarOpen, setIsSidebarOpen] = useState(false);

 return (
 <div className="flex min-h-screen bg-[var(--color-bg-primary)] font-sans text-[var(--color-text-primary)]">
 <Toaster
 position="top-center"
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
 
 <DeliverySidebar 
 isOpen={isSidebarOpen} 
 onClose={() => setIsSidebarOpen(false)} 
 />
 
 <div className="flex-1 flex flex-col min-w-0 md:ml-28">
 <DeliveryTopbar onMenuClick={() => setIsSidebarOpen(true)} />
 <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 pb-24">
 {children}
 </main>
 </div>
 </div>
 );
}
