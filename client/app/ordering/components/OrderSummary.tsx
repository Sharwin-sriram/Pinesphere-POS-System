// components/OrderSummary.tsx

"use client";

export default function OrderSummary() {
  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm sticky top-28">
      <h2 className="text-4xl font-black">
        Order Summary
      </h2>

      <div className="space-y-5 mt-8">
        <div className="flex items-center justify-between">
          <p className="text-gray-500">
            Subtotal
          </p>

          <h3 className="font-bold">
            ₹0
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-500">
            Delivery Fee
          </p>

          <h3 className="font-bold">
            ₹0
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-500">
            Tax
          </p>

          <h3 className="font-bold">
            ₹0
          </h3>
        </div>

        <div className="border-t pt-5 flex items-center justify-between">
          <h2 className="text-2xl font-black">
            Total
          </h2>

          <h2 className="text-4xl font-black text-orange-500">
            ₹0
          </h2>
        </div>
      </div>

      <button className="w-full mt-8 bg-orange-500 hover:bg-orange-600 transition text-white py-5 rounded-2xl font-black text-lg">
        Place Order
      </button>
    </div>
  );
}