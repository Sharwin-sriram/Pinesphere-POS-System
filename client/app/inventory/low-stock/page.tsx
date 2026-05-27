"use client";

import { useEffect, useState } from "react";

import InventoryLayout from "../components/InventoryLayout";

import EmptyState from "../components/EmptyState";

import LoadingSkeleton from "../components/LoadingSkeleton";

import InventoryTable from "../components/InventoryTable";

import { getLowStockItems } from "../services/inventoryApi";

import { InventoryItem } from "../types/inventory";

const columns = [
 {
 key: "name",
 label: "Item",
 },
 {
 key: "sku",
 label: "SKU",
 },
 {
 key: "category",
 label: "Category",
 },
 {
 key: "current_stock",
 label: "Stock",
 },
 {
 key: "reorder_level",
 label: "Reorder Level",
 },
];

export default function LowStockPage() {
 const [items, setItems] = useState<InventoryItem[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");

 useEffect(() => {
 const fetchItems = async () => {
 try {
 const data = await getLowStockItems();
 setItems(data);
 } catch {
 setError("Failed to fetch low stock items");
 } finally {
 setLoading(false);
 }
 };

 const timeoutId = window.setTimeout(() => {
 void fetchItems();
 }, 0);

 return () => window.clearTimeout(timeoutId);
 }, []);

 return (
 <InventoryLayout>
 <h1 className="text-3xl font-semibold mb-6">
 Low Stock Alerts
 </h1>

 <div className="bg-white rounded-2xl p-6 ">
 {loading ? (
 <LoadingSkeleton />
 ) : error ? (
 <p className="text-red-500">{error}</p>
 ) : items.length === 0 ? (
 <EmptyState
 title="No Low Stock Alerts"
 subtitle="Low stock alerts from backend will appear here"
 />
 ) : (
 <InventoryTable columns={columns} data={items} />
 )}
 </div>
 </InventoryLayout>
 );
}