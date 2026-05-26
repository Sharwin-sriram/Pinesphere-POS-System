// components/FloatingCart.tsx

"use client";

import Link from "next/link";

export default function FloatingCart() {
  return (
    <Link
      href="/ordering/cart"
      className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 transition text-white px-6 py-4 rounded-full shadow-2xl z-50 flex items-center gap-3"
    >
      <span className="text-2xl">
        🛒
      </span>

      <div>
        <p className="text-sm">
          View Cart
        </p>

        <h3 className="font-bold">
          0 Items
        </h3>
      </div>
    </Link>
  );
}