// ordering/cart/page.tsx

"use client";

import CartDrawer from "../components/CartDrawer";
import Navbar from "../components/Navbar";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <p className="text-orange-500 font-semibold uppercase tracking-[3px]">
            Your Cart
          </p>

          <h1 className="text-5xl font-black mt-3">
            Review Your Order 🛒
          </h1>
        </div>

        <CartDrawer />
      </main>
    </div>
  );
}