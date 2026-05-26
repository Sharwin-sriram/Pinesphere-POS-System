"use client";

import OrderStatusBadge from "./OrderStatusBadge";

interface LiveOrderCardProps {
  orderId: string;
  customer: string;
  amount: number;
  status:
    | "DRAFT"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "SERVED"
    | "PAID"
    | "CANCELLED";
}

export default function LiveOrderCard({
  orderId,
  customer,
  amount,
  status,
}: LiveOrderCardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm">
            {orderId}
          </p>

          <h2 className="text-2xl font-bold mt-2">
            {customer}
          </h2>

          <p className="text-gray-500 mt-2">
            Live customer order
          </p>
        </div>

        <OrderStatusBadge status={status} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">
            Total Amount
          </p>

          <h2 className="text-3xl font-bold text-blue-600 mt-1">
            ₹{amount}
          </h2>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-2xl font-semibold">
          View Order
        </button>
      </div>
    </div>
  );
}