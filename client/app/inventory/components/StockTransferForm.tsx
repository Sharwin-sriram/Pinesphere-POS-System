"use client";

type Branch = {
 id: number;
 name: string;
};

type InventoryItem = {
 id: number;
 name: string;
};

type Props = {
 branches?: Branch[];
 items?: InventoryItem[];
};

export default function StockTransferForm({
 branches = [],
 items = [],
}: Props) {
 return (
 <div className="bg-white rounded-2xl p-6 ">
 <h2 className="text-2xl font-semibold mb-6">
 Stock Transfer
 </h2>

 <form className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div>
 <label className="text-sm font-medium">
 From Branch
 </label>

 <select className="w-full border rounded-xl px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-blue-500">
 <option value="">
 Select Branch
 </option>

 {branches.map((branch) => (
 <option
 key={branch.id}
 value={branch.id}
 >
 {branch.name}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="text-sm font-medium">
 To Branch
 </label>

 <select className="w-full border rounded-xl px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-blue-500">
 <option value="">
 Select Branch
 </option>

 {branches.map((branch) => (
 <option
 key={branch.id}
 value={branch.id}
 >
 {branch.name}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="text-sm font-medium">
 Inventory Item
 </label>

 <select className="w-full border rounded-xl px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-blue-500">
 <option value="">
 Select Item
 </option>

 {items.map((item) => (
 <option
 key={item.id}
 value={item.id}
 >
 {item.name}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="text-sm font-medium">
 Quantity
 </label>

 <input
 type="number"
 placeholder="Enter quantity"
 className="w-full border rounded-xl px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-blue-500"
 />
 </div>

 <div className="md:col-span-2">
 <label className="text-sm font-medium">
 Notes
 </label>

 <textarea
 rows={4}
 placeholder="Transfer notes..."
 className="w-full border rounded-xl px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-blue-500"
 />
 </div>

 <div className="md:col-span-2 flex justify-end">
 <button
 type="submit"
 className="bg-yellow-500 text-white px-6 py-3 rounded-xl hover:bg-yellow-600 transition"
 >
 Transfer Stock
 </button>
 </div>
 </form>
 </div>
 );
}