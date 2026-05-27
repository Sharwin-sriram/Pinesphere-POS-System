"use client";

type Props = {
 onAddItem?: () => void;
};

export default function InventoryHeader({
 onAddItem,
}: Props) {
 return (
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">
 Inventory Dashboard
 </h1>

 <p className="text-gray-500 mt-1">
 Manage stock, suppliers & purchase orders
 </p>
 </div>

 <button
 onClick={onAddItem}
 className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition"
 >
 + Add Item
 </button>
 </div>
 );
}