"use client";

import { User, Users } from "lucide-react";
import React, { useMemo } from "react";
import Link from "next/link";

import { usePOS } from "../components/shared/POSContext";

const totalTables = 12;

export default function WaiterDashboard() {
 const { orders } = usePOS();

 const tables = useMemo(() => {
 return Array.from({ length: totalTables }, (_, i) => {
 const id = `T${i + 1}`;
 const number = i + 1;
 
 const tableOrders = orders.filter(o => o.tableNumber === id);
 
 let status = "Available";
 if (tableOrders.length > 0) {
 const hasPending = tableOrders.some(o => o.status === "Pending");
 status = hasPending ? "Waiting for food" : "Served";
 }

 return {
 id,
 number,
 status,
 pax: status !== "Available" ? 2 : 0, // Mock pax if occupied
 };
 });
 }, [orders]);

 return (
 <div className="flex flex-col h-full animate-fade-in-up">
 <div className="mb-6">
 <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">Select a Table</h2>
 <p className="text-sm text-gray-500">Tap on a table to start taking an order.</p>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
 {tables.map((table) => {
 let cardClasses = 'border-transparent hover:border-blue-400';
 let circleClasses = 'bg-white text-gray-700';
 let badgeClasses = 'bg-green-100 text-green-600';

 if (table.status === 'Waiting for food') {
 cardClasses = 'border-orange-300 bg-orange-50/50';
 circleClasses = 'bg-orange-100 text-orange-600';
 badgeClasses = 'bg-orange-200 text-orange-700';
 } else if (table.status === 'Served') {
 cardClasses = 'border-green-300 bg-green-50/50';
 circleClasses = 'bg-green-100 text-green-600';
 badgeClasses = 'bg-green-200 text-green-700';
 }

 return (
 <Link
 href={`/waiter/table/${table.id}`}
 key={table.id}
 className={`card-light !p-6 flex flex-col items-center justify-center cursor-pointer transition-all hover:-translate-y-1 hover: ${cardClasses}`}
 >
 <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold mb-3 shadow-inner ${circleClasses}`}>
 {table.number}
 </div>
 
 <div className="text-center">
 <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeClasses}`}>
 {table.status}
 </span>
 </div>

 {table.status !== 'Available' && (
 <div className="flex items-center gap-1 text-xs text-gray-500 mt-3 font-medium">
 <Users className="h-4 w-4" strokeWidth={1.5} /> {table.pax} seated
 </div>
 )}
 </Link>
 );
 })}
 </div>
 </div>
 );
}
