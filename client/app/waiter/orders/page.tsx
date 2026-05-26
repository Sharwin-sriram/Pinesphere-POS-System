"use client";

import { Check, CheckCircle, Clock, DollarSign, LayoutGrid, List, X, XCircle } from "lucide-react";
import React, { useMemo } from "react";
import { usePOS, WaiterOrder } from "../../components/shared/POSContext";

import Link from "next/link";
import toast from "react-hot-toast";

export default function CurrentOrdersPage() {
 const { orders, markAsServed, generateBill, cancelOrder } = usePOS();

 // Group orders by tableNumber
 const groupedOrders = useMemo(() => {
 const groups: { [tableNumber: string]: WaiterOrder[] } = {};
 orders.forEach((order) => {
 if (!groups[order.tableNumber]) {
 groups[order.tableNumber] = [];
 }
 groups[order.tableNumber].push(order);
 });
 return groups;
 }, [orders]);

 const handleGenerateBill = (tableNumber: string) => {
 const total = generateBill(tableNumber);
 toast.success(`Bill generated for Table ${tableNumber}: $${total.toFixed(2)}`);
 };

 return (
 <div className="flex flex-col h-full animate-fade-in-up pb-10">
 <div className="mb-6">
 <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">Current Orders</h2>
 <p className="text-sm text-gray-500">Track and manage active table orders.</p>
 </div>

 {Object.keys(groupedOrders).length === 0 ? (
 <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
 <List className="h-4 w-4 mb-4 text-gray-300" strokeWidth={1.5} />
 <p className="text-lg font-medium text-gray-500">No active orders yet.</p>
 <Link href="/waiter" className="mt-4 text-blue-500 font-semibold hover:underline">
 Go to Tables
 </Link>
 </div>
 ) : (
 <div className="flex flex-col gap-8">
 {Object.entries(groupedOrders).map(([tableNumber, tableOrders]) => {
 // Check if all orders for this table are served
 const allServed = tableOrders.every((o) => o.status === "Served");
 
 return (
 <div key={tableNumber} className="bg-white rounded-2xl p-6 border border-gray-100">
 <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-lg shadow-inner">
 <LayoutGrid className="h-4 w-4 mr-1" strokeWidth={1.5} /> {tableNumber.replace('T', '')}
 </div>
 <div>
 <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Table {tableNumber}</h3>
 <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${allServed ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
 {allServed ? 'All Served' : 'Waiting for food'}
 </span>
 </div>
 </div>
 
 <button 
 onClick={() => handleGenerateBill(tableNumber)}
 className="flex items-center gap-2 bg-gradient-to-tr from-green-500 to-emerald-400 text-white px-4 py-2 rounded-lg font-semibold hover: hover:-translate-y-0.5 transition-all text-sm"
 >
 <DollarSign /> Generate Bill
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {tableOrders.map((order, index) => {
 const isServed = order.status === "Served";

 return (
 <div 
 key={order.orderId} 
 className={`border rounded-xl p-4 flex flex-col transition-all ${
 isServed ? 'border-gray-200 bg-[var(--color-bg-primary)] opacity-80' : 'border-blue-200 bg-blue-50/30'
 }`}
 >
 <div className="flex justify-between items-start mb-3">
 <div>
 <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-md block mb-1 w-fit">
 Order {index + 1}
 </span>
 <span className="text-xs text-gray-500">{order.orderId}</span>
 </div>
 
 <div className="flex items-center gap-2">
 {order.status === "Pending" && (
 <span className="text-xs font-semibold text-orange-600 flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-md ">
 <Clock /> Cooking
 </span>
 )}
 
 {order.status === "Cooked" && (
 <button 
 onClick={() => markAsServed(order.orderId)}
 className="text-xs font-semibold bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-600 transition-colors animate-pulse"
 >
 Pick up & Serve
 </button>
 )}
 
 {order.status === "Served" && (
 <span className="text-xs font-semibold text-green-600 flex items-center gap-1 bg-green-100 px-2 py-1 rounded-md">
 <CheckCircle /> Served
 </span>
 )}

 {order.status !== "Served" && (
 <button 
 onClick={() => cancelOrder(order.orderId)}
 className="text-xs font-semibold bg-red-100 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-200 transition-colors flex items-center gap-1"
 title="Cancel Order"
 >
 <XCircle /> Cancel
 </button>
 )}
 </div>
 </div>

 <div className="flex-1 mb-4">
 <ul className="text-sm text-gray-700 flex flex-col gap-2">
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
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
