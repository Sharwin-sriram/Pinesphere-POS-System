"use client";

import InventoryLayout from "../components/InventoryLayout";

import InventoryHeader from "../components/InventoryHeader";

import InventoryTable from "../components/InventoryTable";

import Pagination from "../components/Pagination";

import StatusBadge from "../components/StatusBadge";

import EmptyState from "../components/EmptyState";

import LoadingSkeleton from "../components/LoadingSkeleton";

import useInventory from "../hooks/useInventory";

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
 key: "status",
 label: "Status",
 },
];

export default function ItemsPage() {
 const {
 items,
 loading,
 error,
 } = useInventory();

 const formattedData =
 items.map((item) => ({
 ...item,

 status: (
 <StatusBadge
 status={
 Number(item.current_stock) <=
 Number(item.reorder_level)
 ? "Low Stock"
 : "In Stock"
 }
 />
 ),
 }));

 return (
 <InventoryLayout>
 <InventoryHeader />

 <div className="bg-white rounded-2xl p-6 mt-6 ">
 {loading ? (
 <LoadingSkeleton />
 ) : error ? (
 <p className="text-red-500">
 {error}
 </p>
 ) : formattedData.length === 0 ? (
 <EmptyState
 title="No Inventory Items"
 subtitle="Items from backend will appear here"
 />
 ) : (
 <>
 <InventoryTable
 columns={columns}
 data={formattedData}
 />

 <Pagination />
 </>
 )}
 </div>
 </InventoryLayout>
 );
}