"use client";

import { Check, CheckCircle, Clock, LayoutGrid, List, X, XCircle } from "lucide-react";
import React, { useMemo } from "react";
import { usePOS } from "../../components/shared/POSContext";

import Link from "next/link";

export default function OrderHistoryPage() {
 const { orderHistory } = usePOS();

 // Sort by timestamp descending
 const sortedHistory = useMemo(() => {
 return [...orderHistory].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
 }, [orderHistory]);

 return (
 <div className="flex flex-col h-full animate-fade-in-up pb-10">
 <div className="mb-6">
 <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">Order History</h2>
 <p className="text-sm text-gray-500">View past orders that were served, cancelled, or billed.</p>
 </div>

 {sortedHistory.length === 0 ? (
 <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
 <List className="h-4 w-4 mb-4 text-gray-300" strokeWidth={1.5} />
 <p className="text-lg font-medium text-gray-500">No order history yet.</p>
 <Link href="/waiter" className="mt-4 text-blue-500 font-semibold hover:underline">
 Go to Tables
 </Link>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {sortedHistory.map((order) => {
 const isCancelled = order.status === "Cancelled";
 const isServed = order.status === "Served" || order.status === "Pending"; // If it was pending but billed, it counts as past

 return (
 <div 
 key={`${order.orderId}-${order.timestamp.getTime()}`} 
 className={`border rounded-xl p-4 flex flex-col transition-all ${
 isCancelled ? 'border-red-200 bg-red-50/50' : 'border-gray-200 bg-[var(--color-bg-primary)]'
 }`}
 >
 <div className="flex justify-between items-start mb-3">
 <div>
 <span className="font-semibold text-[var(--color-text-primary)] block">{order.orderId}</span>
 <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-1">
 <LayoutGrid className="h-4 w-4" strokeWidth={1.5} /> Table {order.tableNumber.replace('T', '')}
 </span>
 </div>
 
 {isCancelled ? (
 <span className="text-xs font-semibold text-red-500 flex items-center gap-1 bg-red-100 px-2 py-1 rounded-md">
 <XCircle /> Cancelled
 </span>
 ) : (
 <span className="text-xs font-semibold text-green-600 flex items-center gap-1 bg-green-100 px-2 py-1 rounded-md">
 <CheckCircle /> Completed
 </span>
 )}
 </div>

 <div className="flex-1 mb-4">
 <span className="text-xs font-semibold text-gray-500 block mb-2 uppercase tracking-wider">
 Dishes Ordered
 </span>
 <ul className="text-sm text-gray-700 flex flex-col gap-1.5">
 {order.items.map((item, idx) => (
 <li key={idx} className="flex justify-between items-start">
 <span className="font-medium flex-1">• {item.name}</span>
 <span className="font-semibold text-[var(--color-text-secondary)] ml-2">${item.price.toFixed(2)}</span>
 </li>
 ))}
 </ul>
 </div>

 <div className="mt-auto pt-3 border-t border-gray-200 flex items-center justify-between">
 <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
 <Clock /> {order.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </span>
 <span className="text-sm font-semibold text-[var(--color-text-primary)]">
 Total: ${order.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
 </span>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
