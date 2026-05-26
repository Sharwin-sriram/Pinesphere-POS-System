"use client";

import "../../globals.css";

import Sidebar from "../../components/dashboard/Sidebar";

import React, { useState } from "react";

type Props = { children: React.ReactNode };

export default function FranchiseLayout({ children }: Props) {
 const [isSidebarOpen, setIsSidebarOpen] = useState(false);

 return (
 <html lang="en">
 <body style={{ backgroundColor: "#f3f4f6", color: "#111827" }}>
 <div className="flex min-h-screen">
 {/* SIDEBAR */}
 <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

 {/* PAGE */}
 <main style={{ flex: 1, backgroundColor: "#f3f4f6", color: "#111827" }}>
 {children}
 </main>
 </div>
 </body>
 </html>
 );
}