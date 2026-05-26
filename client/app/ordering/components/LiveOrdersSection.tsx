"use client";

import LiveOrderCard from "./LiveOrderCard";

const liveOrders = [
  {
    orderId: "#ORD1001",
    customer: "Arun Kumar",
    amount: 469,
    status: "PREPARING",
  },

  {
    orderId: "#ORD1002",
    customer: "Priya",
    amount: 299,
    status: "CONFIRMED",
  },

  {
    orderId: "#ORD1003",
    customer: "Rahul",
    amount: 799,
    status: "READY",
  },
];

export default function LiveOrdersSection() {
  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-blue-600 font-semibold">
            Real Time Orders
          </p>

          <h2 className="text-4xl font-bold mt-2">
            Live Order Queue ⚡
          </h2>
        </div>

        <button className="border px-5 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition">
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {liveOrders.map((order) => (
          <LiveOrderCard
            key={order.orderId}
            orderId={order.orderId}
            customer={order.customer}
            amount={order.amount}
            status={order.status as any}
          />
        ))}
      </div>
    </div>
  );
}