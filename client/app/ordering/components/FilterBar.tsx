// components/FilterBar.tsx

"use client";

export default function FilterBar() {
  return (
    <div className="flex flex-wrap gap-4 mt-8">
      <button className="bg-white px-5 py-3 rounded-2xl shadow-sm font-semibold hover:bg-orange-500 hover:text-white transition">
        Veg
      </button>

      <button className="bg-white px-5 py-3 rounded-2xl shadow-sm font-semibold hover:bg-orange-500 hover:text-white transition">
        Non Veg
      </button>

      <button className="bg-white px-5 py-3 rounded-2xl shadow-sm font-semibold hover:bg-orange-500 hover:text-white transition">
        Bestseller
      </button>

      <button className="bg-white px-5 py-3 rounded-2xl shadow-sm font-semibold hover:bg-orange-500 hover:text-white transition">
        Fast Delivery
      </button>
    </div>
  );
}