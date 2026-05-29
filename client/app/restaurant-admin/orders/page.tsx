"use client";

import { CheckCircle, Clock, Pencil, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const mockOrders = [
  { id: "01", name: "Watson Joyce", orderNo: "990", status: "Ready", subStatus: "Ready to serve", time: "4:48 PM", total: 649, items: [{ name: "Scrambled eggs", price: 199 }, { name: "Smoked Salmon", price: 120 }, { name: "Belgian Waffles", price: 220 }, { name: "Classic Lemonade", price: 110 }] },
  { id: "02", name: "Sarah Connor", orderNo: "991", status: "In Process", subStatus: "Cooking Now", time: "4:50 PM", total: 319, items: [{ name: "Scrambled eggs", price: 199 }, { name: "Classic Lemonade", price: 120 }] },
  { id: "03", name: "John Doe", orderNo: "992", status: "In Process", subStatus: "In the Kitchen", time: "4:55 PM", total: 440, items: [{ name: "Belgian Waffles", price: 220 }, { name: "Belgian Waffles", price: 220 }] },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState("0.00");

  const tabs = ["All", "In Process", "Completed", "Cancelled"];
  const pinPad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "x"];

  const handlePinPress = (key: string) => {
    if (key === "x") {
      setTipAmount("0.00");
    } else {
      if (tipAmount === "0.00") setTipAmount(key + ".00");
      else setTipAmount(tipAmount.split(".")[0] + key + ".00");
    }
  };

  const filteredOrders = mockOrders.filter(order => {
    if (activeTab === "All") return true;
    return order.status === activeTab;
  });

  return (
    <div className="flex flex-col h-full animate-fade-in-up">
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 bg-[var(--color-bg-tertiary)] p-1 rounded-xl">
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold text-[length:var(--text-sm)] transition-all ${
                activeTab === tab 
                  ? "bg-[var(--color-accent-green)] text-white shadow-sm" 
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <Button variant="success-outline" size="sm" className="ml-auto">
          + Add New Order
        </Button>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map(order => (
          <div key={order.id} className="card-light !p-5 flex flex-col hover:border-[var(--color-accent-green)] transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl text-lg font-semibold ${
                  order.status === 'Ready' 
                    ? 'bg-[var(--color-accent-green-subtle)] text-[var(--color-accent-green)]' 
                    : 'bg-[var(--color-blue-subtle)] text-[var(--color-blue)]'
                }`}>
                  {order.id}
                </div>
                <div>
                  <h3 className="text-[var(--color-text-primary)] font-semibold text-[length:var(--text-base)]">{order.name}</h3>
                  <p className="text-[length:var(--text-xs)] text-[var(--color-text-muted)]">Order # {order.orderNo}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Badge variant={order.status === 'Ready' ? 'success' : 'warning'} className="mb-1">
                  <CheckCircle className="h-3 w-3" strokeWidth={2} /> {order.status}
                </Badge>
                <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1 mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'Ready' ? 'bg-[var(--color-accent-green)]' : 'bg-[var(--color-accent)]'}`} />
                  {order.subStatus}
                </span>
              </div>
            </div>
            
            <div className="text-[length:var(--text-xs)] text-[var(--color-text-secondary)] mb-4 pb-4 border-b border-[var(--color-border)] flex justify-between">
              <span>Wednesday, 28, 2026</span>
              <span className="flex items-center gap-1 font-medium"><Clock className="h-3.5 w-3.5" /> {order.time}</span>
            </div>

            <div className="flex-1 flex flex-col gap-2 mb-4">
              <div className="flex justify-between text-[length:var(--text-xs)] text-[var(--color-text-muted)] font-semibold mb-1">
                <span>Qty</span> <span className="flex-1 ml-4">Items</span> <span>Price</span>
              </div>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[length:var(--text-sm)] text-[var(--color-text-secondary)] font-medium">
                  <span className="text-[var(--color-text-muted)]">01</span> <span className="flex-1 ml-4 truncate">{item.name}</span> <span>${item.price}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mb-6 pt-4 border-t border-[var(--color-border)]">
              <span className="text-[var(--color-text-secondary)] font-medium">SubTotal</span>
              <span className="text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]">${order.total}</span>
            </div>

            <div className="grid grid-cols-4 gap-3 mt-auto">
              <Button 
                variant="outline" 
                className="col-span-1 h-12 rounded-xl text-[var(--color-blue)] hover:text-[var(--color-blue-hover)] hover:border-[var(--color-blue-hover)] hover:bg-[var(--color-blue-subtle)]"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="danger" 
                className="col-span-1 h-12 rounded-xl"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="success" 
                onClick={() => setShowTipModal(true)}
                className="col-span-2 h-12 rounded-xl"
              >
                Pay Bill
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Tip / PIN Modal */}
      {showTipModal && (
        <div className="fixed inset-0 bg-[var(--color-bg-overlay)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-light border-0 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col items-center p-8 animate-fade-in-up relative shadow-xl">
            <button onClick={() => setShowTipModal(false)} className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
            
            <h3 className="text-[var(--color-text-secondary)] font-semibold mb-4 text-[length:var(--text-base)]">Tips Amount</h3>
            <div className="text-5xl font-semibold text-[var(--color-text-primary)] mb-10 tracking-wider">
              {tipAmount}
            </div>

            <div className="grid grid-cols-3 gap-4 w-full px-4 mb-8">
              {pinPad.map(key => (
                <button 
                  key={key} 
                  onClick={() => handlePinPress(key)}
                  className={`py-4 text-xl font-semibold rounded-xl transition-all ${
                    key === 'x' 
                      ? 'bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)]' 
                      : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-green-subtle)] hover:text-[var(--color-accent-green)] border border-[var(--color-border)] shadow-sm'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
            
            <div className="w-full flex justify-between items-center px-4">
              <button className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm font-semibold transition-colors">
                Print Receipt
              </button>
              <Button 
                onClick={() => setShowTipModal(false)}
                variant="success"
                className="px-8 h-12 rounded-xl"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
