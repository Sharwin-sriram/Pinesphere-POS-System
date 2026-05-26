"use client";

import React from "react";
import { usePOS } from "../components/shared/POSContext";
import { FiDollarSign, FiClock, FiGrid, FiList } from "react-icons/fi";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CashierDashboard() {
  const { bills, payBill } = usePOS();
  
  const pendingBills = bills.filter(b => b.status === "Unpaid");

  const handlePayAmount = (billId: string, tableNumber: string, amount: number) => {
    payBill(billId);
    toast.success(`Payment of $${amount.toFixed(2)} received for Table ${tableNumber}`);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in-up pb-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pending Bills</h2>
        <p className="text-sm text-gray-500">Manage and finalize payments for tables.</p>
      </div>

      {pendingBills.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <FiList size={48} className="mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">No pending bills right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingBills.map((bill) => {
            return (
              <div key={bill.billId} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-lg shadow-inner">
                      <FiGrid size={18} className="mr-1" /> {bill.tableNumber.replace('T', '')}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Table {bill.tableNumber}</h3>
                      <span className="text-xs font-bold text-green-600 flex items-center gap-1 mt-1">
                        <FiClock size={12} /> {bill.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 mb-6">
                  <span className="text-xs font-bold text-gray-500 block mb-2 uppercase tracking-wider">
                    Consumed Food
                  </span>
                  <ul className="text-sm text-gray-700 flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar-light pr-2">
                    {bill.orders.map((order, oIdx) => (
                      <React.Fragment key={oIdx}>
                        {order.items.map((item, idx) => (
                          <li key={`${oIdx}-${idx}`} className="flex justify-between items-start">
                            <span className="font-medium flex-1">• {item.name}</span>
                            <span className="font-bold text-gray-600 ml-2">${item.price.toFixed(2)}</span>
                          </li>
                        ))}
                      </React.Fragment>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl mb-4">
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-sm">Total Amount</span>
                    <span className="text-2xl font-bold text-gray-800">${bill.totalAmount.toFixed(2)}</span>
                  </div>
                  
                  <button 
                    onClick={() => handlePayAmount(bill.billId, bill.tableNumber, bill.totalAmount)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-tr from-green-500 to-emerald-400 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                  >
                    <FiDollarSign size={20} /> Pay Amount
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
