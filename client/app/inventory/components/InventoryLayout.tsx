"use client";

import { ReactNode } from "react";

import InventorySidebar from "./InventorySidebar";

import MobileSidebar from "./MobileSidebar";

type Props = {
 children: ReactNode;
};

export default function InventoryLayout({
 children,
}: Props) {
 return (
 <div className="flex min-h-screen bg-[#f5f7fb]">
 <MobileSidebar />

 <InventorySidebar />

 <main className="flex-1 p-6">
 {children}
 </main>
 </div>
 );
}