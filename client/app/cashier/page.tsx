"use client";

import { Clock, DollarSign, LayoutGrid, List } from "lucide-react";
import React from "react";
import { usePOS } from "../components/shared/POSContext";

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
      <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">Pending Bills</h2>
      <p className="text-sm text-[var(--color-text-secondary)]">Manage and finalize payments for tables.</p>
    </div>

    {pendingBills.length === 0 ? (
      <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-text-muted)]">
        <List className="h-4 w-4 mb-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
        <p className="text-lg font-medium text-[var(--color-text-secondary)]">No pending bills right now.</p>
      </div>
 ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingBills.map((bill) => {
          return (
            <div key={bill.billId} className="bg-[var(--color-bg-secondary)] rounded-2xl p-6 border border-[var(--color-border)] flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-semibold text-lg shadow-inner">
                    <LayoutGrid className="h-4 w-4 mr-1" strokeWidth={1.5} /> {bill.tableNumber.replace('T', '')}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Table {bill.tableNumber}</h3>
                    <span className="text-xs font-semibold text-green-600 flex items-center gap-1 mt-1">
 <Clock className="h-4 w-4" strokeWidth={1.5} /> {bill.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </span>
 </div>
 </div>
 </div>

              <div className="flex-1 mb-6">
                <span className="text-xs font-semibold text-[var(--color-text-secondary)] block mb-2 uppercase tracking-wider">
                  Consumed Food
                </span>
                <ul className="text-sm text-[var(--color-text-primary)] flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar-light pr-2">
 {bill.orders.map((order, oIdx) => (
 <React.Fragment key={oIdx}>
 {order.items.map((item, idx) => (
 <li key={`${oIdx}-${idx}`} className="flex justify-between items-start">
 <span className="font-medium flex-1">• {item.name}</span>
 <span className="font-semibold text-[var(--color-text-secondary)] ml-2">${item.price.toFixed(2)}</span>
 </li>
 ))}
 </React.Fragment>
 ))}
 </ul>
 </div>

              <div className="mt-auto">
                <div className="flex justify-between items-center bg-[var(--color-bg-primary)] border border-[var(--color-border)] p-4 rounded-xl mb-4">
                  <span className="text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider text-sm">Total Amount</span>
                  <span className="text-2xl font-semibold text-[var(--color-text-primary)]">${bill.totalAmount.toFixed(2)}</span>
                </div>
 
                <button 
                  onClick={() => handlePayAmount(bill.billId, bill.tableNumber, bill.totalAmount)}
                  className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent)] text-[var(--color-text-inverse)] px-6 py-3.5 rounded-xl font-semibold hover:-translate-y-1 transition-all"
                >
                  <DollarSign className="h-4 w-4" strokeWidth={1.5} /> Pay Amount
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
