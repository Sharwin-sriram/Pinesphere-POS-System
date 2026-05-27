"use client";

import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import StatsCard from "./components/StatsCard";
import OrderCard from "./components/OrderCard";
import OrderModal from "./components/OrderModal";
import KDSAnalytics from "./components/KDSAnalytics";

import { Order } from "./types/order";

import {
 getKdsBootstrap,
 updateOrderStatusAPI,
} from "./services/orderService";

export default function KDSPage() {

 const [orders, setOrders] =
 useState<Order[]>([]);

 const [selectedOrder, setSelectedOrder] =
 useState<Order | null>(null);

 const [searchTerm, setSearchTerm] =
 useState("");

 const [loading, setLoading] =
 useState(true);

 const [kitchenId, setKitchenId] =
 useState<string | null>(null);

 const [kitchenName, setKitchenName] =
 useState<string | null>(null);

 // FETCH ORDERS
 const fetchOrders = async () => {

 try {

 setLoading(true);

 const data =
 await getKdsBootstrap();

 setOrders(data.orders || []);
 setKitchenId(data.kitchenId);
 setKitchenName(data.kitchenName);

 } catch (error) {

 console.log(error);

 setOrders([]);

 } finally {

 setLoading(false);

 }

 };

 useEffect(() => {

 const timeoutId = window.setTimeout(() => {
 void fetchOrders();
 }, 0);

 return () => window.clearTimeout(timeoutId);

 }, []);

 // SEARCH FILTER
 const searchedOrders =
 orders.filter((order) => {

 return (
 order.id
 ?.toLowerCase()
 .includes(searchTerm.toLowerCase()) ||

 order.table
 ?.toLowerCase()
 .includes(searchTerm.toLowerCase())
 );

 });

 // STATUS GROUPS
 const preparingOrders =
 searchedOrders.filter(
 (order) =>
 order.status === "Preparing"
 );

 const readyOrders =
 searchedOrders.filter(
 (order) =>
 order.status === "Ready"
 );

 const delayedOrders =
 searchedOrders.filter(
 (order) =>
 order.status === "Delayed"
 );

 // UPDATE STATUS
 const updateOrderStatus =
 async (
 orderId: string,
 newStatus: string
 ) => {

 if (!kitchenId) {
 return;
 }

 const updatedOrders =
 orders.map((order) => {

 if (
 order.id === orderId
 ) {

 return {
 ...order,
 status: newStatus,
 };

 }

 return order;

 });

 setOrders(updatedOrders);

 await updateOrderStatusAPI(
 kitchenId,
 orderId,
 newStatus
 );

 await fetchOrders();

 };

 // LOADING
 if (loading) {

 return (
 <div className="flex items-center justify-center min-h-screen text-2xl font-semibold">
 Loading Kitchen Dashboard...
 </div>
 );

 }

 return (
 <div>

 {/* NAVBAR */}
 <Navbar />

 {/* STATS */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

 <StatsCard
 title="Total Orders"
 value={orders.length.toString()}
 />

 <StatsCard
 title="Preparing"
 value={preparingOrders.length.toString()}
 />

 <StatsCard
 title="Ready"
 value={readyOrders.length.toString()}
 />

 <StatsCard
 title="Delayed"
 value={delayedOrders.length.toString()}
 />

 </div>

 {/* TOP */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
        <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Kitchen Workflow Queue
        </h2>

 <h2 className="text-2xl font-semibold">
 {kitchenName ? `${kitchenName} Workflow Queue` : "Kitchen Workflow Queue"}
 </h2>

      {/* EMPTY STATE */}
      {orders.length === 0 ? (
        <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-12 text-center border border-[var(--color-border)] shadow-sm">
          <h2 className="text-2xl font-semibold mb-3 text-[var(--color-text-primary)]">
            No Orders Available
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            Orders from backend will appear here.
          </p>
        </div>
      ) : (

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

 {/* PREPARING */}
 <div className="bg-yellow-50 rounded-2xl p-5">

 <div className="flex items-center justify-between mb-5">

 <h2 className="text-xl font-semibold text-yellow-700">
 Preparing
 </h2>

 <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
 {preparingOrders.length}
 </span>

 </div>

 <div className="space-y-5">

 {preparingOrders.map(
 (order) => (

 <OrderCard
 key={order.id}
 id={order.id}
 backendId={order.backendId}
 table={order.table}
 items={order.items}
 status={order.status}
 time={order.time}
 priority={order.priority}
 onView={() =>
 setSelectedOrder(
 order
 )
 }
 onStatusChange={
 updateOrderStatus
 }
 />

 )
 )}

 </div>

 </div>

 {/* READY */}
 <div className="bg-green-50 rounded-2xl p-5">

 <div className="flex items-center justify-between mb-5">

 <h2 className="text-xl font-semibold text-green-700">
 Ready
 </h2>

 <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
 {readyOrders.length}
 </span>

 </div>

 <div className="space-y-5">

 {readyOrders.map(
 (order) => (

 <OrderCard
 key={order.id}
 id={order.id}
 backendId={order.backendId}
 table={order.table}
 items={order.items}
 status={order.status}
 time={order.time}
 priority={order.priority}
 onView={() =>
 setSelectedOrder(
 order
 )
 }
 onStatusChange={
 updateOrderStatus
 }
 />

 )
 )}

 </div>

 </div>

 {/* DELAYED */}
 <div className="bg-red-50 rounded-2xl p-5">

 <div className="flex items-center justify-between mb-5">

 <h2 className="text-xl font-semibold text-red-700">
 Delayed
 </h2>

 <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
 {delayedOrders.length}
 </span>

 </div>

 <div className="space-y-5">

 {delayedOrders.map(
 (order) => (

 <OrderCard
 key={order.id}
 id={order.id}
 backendId={order.backendId}
 table={order.table}
 items={order.items}
 status={order.status}
 time={order.time}
 priority={order.priority}
 onView={() =>
 setSelectedOrder(
 order
 )
 }
 onStatusChange={
 updateOrderStatus
 }
 />

 )
 )}

 </div>

 </div>

 </div>

 )}

 {/* ANALYTICS */}
 <KDSAnalytics />

 {/* MODAL */}
 <OrderModal
 order={selectedOrder}
 onClose={() =>
 setSelectedOrder(null)
 }
 />

 </div>
 );
}