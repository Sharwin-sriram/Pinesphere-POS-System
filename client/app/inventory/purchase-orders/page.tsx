"use client";

import { useEffect, useState } from "react";

import InventoryLayout from "../components/InventoryLayout";

import LoadingSkeleton from "../components/LoadingSkeleton";

import EmptyState from "../components/EmptyState";

import InventoryTable from "../components/InventoryTable";

import StatusBadge from "../components/StatusBadge";

import CreatePOForm from "../components/CreatePOForm";

import { getPurchaseOrders } from "../services/inventoryApi";

type PurchaseOrderRow = {
 id: number;
 po_number: string;
 supplier?: { name: string };
 total: string;
 status: string;
};

const columns = [
 {
 key: "po_number",
 label: "PO Number",
 },
 {
 key: "supplier",
 label: "Supplier",
 },
 {
 key: "total",
 label: "Total",
 },
 {
 key: "status",
 label: "Status",
 },
];

export default function PurchaseOrdersPage() {
 const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderRow[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");

 useEffect(() => {
 const fetchPurchaseOrders = async () => {
 try {
 const data = await getPurchaseOrders();
 setPurchaseOrders(data);
 } catch {
 setError("Failed to fetch purchase orders");
 } finally {
 setLoading(false);
 }
 };

 const timeoutId = window.setTimeout(() => {
 void fetchPurchaseOrders();
 }, 0);

 return () => window.clearTimeout(timeoutId);
 }, []);

 return (
 <InventoryLayout>
 <h1 className="text-3xl font-semibold">
 Purchase Orders
 </h1>

 <div className="space-y-6 mt-6">
 <CreatePOForm />

 <div className="bg-white rounded-2xl p-6 ">
 <h2 className="text-xl font-semibold mb-5">
 Purchase Orders
 </h2>

 {loading ? (
 <LoadingSkeleton />
) : error ? (
 <p className="text-red-500">{error}</p>
 ) : purchaseOrders.length ===
 0 ? (
 <EmptyState
 title="No Purchase Orders"
 subtitle="Purchase orders from backend will appear here"
 />
 ) : (
 <InventoryTable
 columns={columns}
 data={purchaseOrders.map(
 (po) => ({
 ...po,

 supplier:
 po.supplier?.name,

 status: (
 <StatusBadge
 status={
 po.status
 }
 />
 ),
 })
 )}
 />
 )}
 </div>
 </div>
 </InventoryLayout>
 );
}