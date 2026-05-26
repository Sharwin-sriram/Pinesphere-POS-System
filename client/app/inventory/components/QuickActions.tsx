"use client";

export default function QuickActions() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-5">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <button className="bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
          Add Item
        </button>

        <button className="bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition">
          Create PO
        </button>

        <button className="bg-yellow-500 text-white py-3 rounded-xl font-semibold hover:bg-yellow-600 transition">
          Transfer Stock
        </button>

        <button className="bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition">
          Low Stock
        </button>
      </div>
    </div>
  );
}