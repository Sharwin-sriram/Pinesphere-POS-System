// ordering/checkout/page.tsx

"use client";

import CheckoutSteps from "../components/CheckoutSteps";
import CustomerDetailsCard from "../components/CustomerDetailsCard";
import Navbar from "../components/Navbar";
import OrderSummary from "../components/OrderSummary";
import PaymentMethods from "../components/PaymentMethods";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#f6f6f6] pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <p className="text-orange-500 font-semibold uppercase tracking-[3px]">
            Secure Checkout
          </p>

          <h1 className="text-5xl font-black mt-3">
            Complete Your Order 💳
          </h1>
        </div>

        <CheckoutSteps />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-10">
          <div className="xl:col-span-2 space-y-8">
            <CustomerDetailsCard />

            <PaymentMethods />
          </div>

          <OrderSummary />
        </div>
      </main>
    </div>
  );
}