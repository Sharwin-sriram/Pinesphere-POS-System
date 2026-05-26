"use client";

import React, { useMemo } from "react";
import { usePOS } from "../components/shared/POSContext";
import { FiCheck, FiClock, FiGrid, FiList } from "react-icons/fi";
import toast from "react-hot-toast";

export default function KitchenDashboard() {
  const { orders, markAsCooked } = usePOS();
  
  // Show only pending orders in the kitchen
  const pendingOrders = orders.filter(o => o.status === "Pending");

  // Sort by oldest first so kitchen knows what to cook first
  const sortedPendingOrders = useMemo(() => {
    return [...pendingOrders].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [pendingOrders]);

  const handleMarkAsCooked = (orderId: string, tableNumber: string) => {
    markAsCooked(orderId);
    toast.success(`Order for Table ${tableNumber} marked as Cooked! Waiter notified.`);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in-up pb-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Active Kitchen Orders</h2>
        <p className="text-sm text-gray-500">Prepare these dishes. Oldest orders appear first.</p>
      </div>

      {sortedPendingOrders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <FiList size={48} className="mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">No active orders right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPendingOrders.map((order) => {
            return (
              <div key={order.orderId} className="bg-white rounded-2xl p-6 shadow-sm border border-orange-200 flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg shadow-inner">
                      <FiGrid size={18} className="mr-1" /> {order.tableNumber.replace('T', '')}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Table {order.tableNumber}</h3>
                      <span className="text-xs font-bold text-gray-500">
                        {order.orderId}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-orange-600 flex items-center gap-1 mt-1 bg-orange-50 px-2 py-1 rounded-md">
                    <FiClock size={12} /> {order.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex-1 mb-6">
                  <span className="text-xs font-bold text-gray-500 block mb-2 uppercase tracking-wider">
                    Dishes to Prepare
                  </span>
                  <ul className="text-lg text-gray-800 flex flex-col gap-3 font-medium">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto">
                  <button 
                    onClick={() => handleMarkAsCooked(order.orderId, order.tableNumber)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-tr from-orange-500 to-red-400 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                  >
                    <FiCheck size={20} /> Mark as Cooked
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
