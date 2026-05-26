// components/Navbar.tsx

"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link
          href="/ordering"
          className="text-3xl font-black text-orange-500"
        >
          PineSphere 🍔
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
          <Link href="/ordering">
            Home
          </Link>

          <Link href="/ordering/menu">
            Menu
          </Link>

          <Link href="/ordering/cart">
            Cart
          </Link>

          <Link href="/ordering/tracking">
            Tracking
          </Link>
        </nav>

        <button className="bg-orange-500 hover:bg-orange-600 transition text-white px-5 py-3 rounded-2xl font-semibold">
          Login
        </button>
      </div>
    </header>
  );
}