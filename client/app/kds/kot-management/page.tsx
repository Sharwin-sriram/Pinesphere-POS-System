"use client";

import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";

import {
 getOrders,
 updateOrderStatusAPI,
} from "../services/orderService";

type KOTOrder = {
 id: string;
 table: string;
 chef?: string;
 items: number;
 status: string;
};

export default function KOTManagementPage() {

 const [orders, setOrders] =
 useState<KOTOrder[]>([]);

 const [loading, setLoading] =
 useState(true);

 // FETCH KOT DATA
 const fetchOrders = async () => {

 try {

 setLoading(true);

 const data =
 await getOrders();

 setOrders(data || []);

 } catch (error) {

 console.log(error);

 setOrders([]);

 } finally {

 setLoading(false);

 }

 };

 useEffect(() => {

 fetchOrders();

 }, []);

 // UPDATE STATUS
 const updateStatus = async (
 orderId: string,
 newStatus: string
 ) => {

 const updatedOrders =
 orders.map((order) => {

 if (order.id === orderId) {

 return {
 ...order,
 status: newStatus,
 };

 }

 return order;

 });

 setOrders(updatedOrders);

 await updateOrderStatusAPI(
 orderId,
 newStatus
 );

 };

 const statusStyles = {
 Preparing:
 "bg-yellow-100 text-yellow-700",

 Ready:
 "bg-green-100 text-green-700",

 Delayed:
 "bg-red-100 text-red-700",
 };

 // LOADING STATE
 if (loading) {

 return (
 <div className="flex items-center justify-center min-h-screen text-2xl font-semibold">
 Loading KOT Management...
 </div>
 );

 }

 return (
 <div>

 {/* NAVBAR */}
 <Navbar />

 {/* HEADER */}
 <div className="flex items-center justify-between mb-8">

 <div>

 <h1 className="text-3xl font-semibold">
 KOT Management
 </h1>

 <p className="text-gray-500 mt-1">
 Manage kitchen order tickets
 </p>

 </div>

 </div>

 {/* EMPTY STATE */}
 {orders.length === 0 ? (

 <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">

 <h2 className="text-2xl font-semibold mb-3">
 No KOT Data Available
 </h2>

 <p className="text-gray-500">
 Kitchen ticket data from backend will appear here.
 </p>

 </div>

 ) : (

 <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

 <table className="w-full">

 <thead className="bg-[var(--color-bg-tertiary)]">

 <tr>

 <th className="text-left px-6 py-4">
 Order ID
 </th>

 <th className="text-left px-6 py-4">
 Table
 </th>

 <th className="text-left px-6 py-4">
 Chef
 </th>

 <th className="text-left px-6 py-4">
 Items
 </th>

 <th className="text-left px-6 py-4">
 Status
 </th>

 <th className="text-left px-6 py-4">
 Actions
 </th>

 </tr>

 </thead>

 <tbody>

 {orders.map((order) => (

 <tr
 key={order.id}
 className="border-t border-gray-100 hover:bg-[var(--color-bg-primary)] transition"
 >

 <td className="px-6 py-5 font-semibold">
 {order.id}
 </td>

 <td className="px-6 py-5">
 {order.table}
 </td>

 <td className="px-6 py-5">
 {order.chef || "-"}
 </td>

 <td className="px-6 py-5">
 {order.items}
 </td>

 <td className="px-6 py-5">

 <span
 className={`
 px-3 py-1 rounded-full text-sm
 ${
 statusStyles[
 order.status as keyof typeof statusStyles
 ]
 }
 `}
 >
 {order.status}
 </span>

 </td>

 <td className="px-6 py-5">

 <div className="flex gap-3">

 <button
 onClick={() =>
 updateStatus(
 order.id,
 "Preparing"
 )
 }
 className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 transition"
 >
 Preparing
 </button>

 <button
 onClick={() =>
 updateStatus(
 order.id,
 "Ready"
 )
 }
 className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition"
 >
 Ready
 </button>

 </div>

 </td>

 </tr>

 ))}

 </tbody>

 </table>

 </div>

 )}

 </div>
 );
}