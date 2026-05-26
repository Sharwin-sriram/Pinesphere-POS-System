"use client";

import React, { useState } from "react";
import SuperAdminSidebar from "../components/super-admin/SuperAdminSidebar";
import SuperAdminHeader from "../components/super-admin/SuperAdminHeader";
import { Toaster } from "react-hot-toast";

export default function SuperAdminLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const [isSidebarOpen, setIsSidebarOpen] = useState(false);

 return (
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
 
 <SuperAdminSidebar 
 isOpen={isSidebarOpen} 
 onClose={() => setIsSidebarOpen(false)} 
 />
 
 <div className="flex-1 flex flex-col min-w-0 lg:ml-28">
 <SuperAdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
 <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
 {children}
 </main>
 </div>
 </div>
 );
}
