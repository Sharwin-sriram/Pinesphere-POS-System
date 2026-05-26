// components/OrderStatusTracker.tsx

"use client";

export default function OrderStatusTracker() {
  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm">
      <h2 className="text-4xl font-black">
        Live Order Status 🚚
      </h2>

      <div className="space-y-6 mt-10">
        {[
          "Order Confirmed",
          "Preparing Food",
          "Out For Delivery",
          "Delivered",
        ].map((step, index) => (
          <div
            key={step}
            className="flex items-center gap-5"
          >
            <div
              className={`w-6 h-6 rounded-full ${
                index < 2
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            />

            <p className="font-bold text-lg">
              {step}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}