"use client";

import { orders } from "../data/mockData";

export default function ActiveOrdersTable() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 overflow-x-auto">
      <h2 className="text-xl font-bold mb-5">
        Active Orders
      </h2>

      <table className="w-full">
        <thead>
          <tr className="text-left border-b">
            <th className="pb-3">Order ID</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Delivery</th>
            <th>Rider</th>
            <th>ETA</th>
            <th>Amount</th>
            <th>Payment</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b hover:bg-gray-50"
            >
              <td className="py-4 font-medium">
                #{order.id}
              </td>

              <td>{order.customer}</td>

              <td>
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                  {order.status}
                </span>
              </td>

              <td>
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                  {order.deliveryStatus}
                </span>
              </td>

              <td>{order.rider}</td>

              <td>{order.eta}</td>

              <td>
                ₹{order.netAmount}
              </td>

              <td>
                {order.paymentMethod}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}