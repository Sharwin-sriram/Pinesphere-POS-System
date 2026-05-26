// components/ScheduledOrder.tsx

"use client";

export default function ScheduledOrder() {
  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm">
      <p className="text-orange-500 font-semibold uppercase tracking-[3px]">
        Scheduled Delivery
      </p>

      <h2 className="text-4xl font-black mt-4">
        Schedule Your Order ⏰
      </h2>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <input
          type="date"
          className="border border-gray-200 rounded-2xl px-5 py-4 outline-none"
        />

        <input
          type="time"
          className="border border-gray-200 rounded-2xl px-5 py-4 outline-none"
        />
      </div>

      <button className="mt-8 bg-orange-500 hover:bg-orange-600 transition text-white px-6 py-4 rounded-2xl font-bold">
        Schedule Order
      </button>
    </div>
  );
}