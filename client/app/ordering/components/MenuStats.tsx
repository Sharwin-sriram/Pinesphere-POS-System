// components/MenuStats.tsx

"use client";

export default function MenuStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <div className="bg-white rounded-[32px] p-8 shadow-sm">
        <p className="text-gray-500">
          Total Dishes
        </p>

        <h2 className="text-5xl font-black mt-4">
          --
        </h2>
      </div>

      <div className="bg-white rounded-[32px] p-8 shadow-sm">
        <p className="text-gray-500">
          Active Orders
        </p>

        <h2 className="text-5xl font-black mt-4">
          --
        </h2>
      </div>

      <div className="bg-white rounded-[32px] p-8 shadow-sm">
        <p className="text-gray-500">
          Delivery Time
        </p>

        <h2 className="text-5xl font-black mt-4">
          --
        </h2>
      </div>
    </div>
  );
}