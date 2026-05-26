// components/CartDrawer.tsx

"use client";

import Link from "next/link";

export default function CartDrawer() {
  return (
    <div className="bg-white rounded-[32px] p-10 shadow-sm">
      <div className="text-center py-16">
        <div className="text-8xl">
          🛒
        </div>

        <h2 className="text-4xl font-black mt-6">
          Your cart is empty
        </h2>

        <p className="text-gray-500 mt-4 text-lg">
          Add delicious items from the menu.
        </p>

        <Link
          href="/ordering/menu"
          className="inline-block mt-8 bg-orange-500 hover:bg-orange-600 transition text-white px-8 py-4 rounded-2xl font-bold"
        >
          Browse Menu
        </Link>
      </div>
    </div>
  );
}