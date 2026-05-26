// components/MenuHeader.tsx

"use client";

export default function MenuHeader() {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
      <div>
        <p className="text-orange-500 font-semibold uppercase tracking-[3px]">
          Food Menu
        </p>

        <h1 className="text-5xl font-black mt-3">
          Explore Dishes 🍕
        </h1>
      </div>

      <button className="bg-orange-500 hover:bg-orange-600 transition text-white px-6 py-4 rounded-2xl font-bold">
        View Offers
      </button>
    </div>
  );
}