"use client";

import React, { useState } from "react";
import { FiCheckCircle, FiEdit2, FiTrash2, FiClock } from "react-icons/fi";

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

  return (
    <div className="flex flex-col h-full animate-fade-in-up">
      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-800">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeTab === tab ? "bg-[#EA7C69] text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
          >
            {tab}
          </button>
        ))}
        <button className="ml-auto bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all border border-gray-700">
          + Add New Order
        </button>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockOrders.map(order => (
          <div key={order.id} className="bg-[#252836] border border-gray-800 rounded-2xl p-5 flex flex-col hover:border-[#EA7C69]/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl text-xl font-bold ${order.status === 'Ready' ? 'bg-[#ffb6c1] text-[#1f1d2b]' : 'bg-[#EA7C69]/20 text-[#EA7C69]'}`}>
                  {order.id}
                </div>
                <div>
                  <h3 className="text-white font-bold">{order.name}</h3>
                  <p className="text-xs text-gray-500">Order # {order.orderNo}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-xs px-2 py-1 rounded font-bold mb-1 flex items-center gap-1 ${order.status === 'Ready' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                  <FiCheckCircle /> {order.status}
                </span>
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'Ready' ? 'bg-green-500' : 'bg-orange-500'}`} />
                  {order.subStatus}
                </span>
              </div>
            </div>
            
            <div className="text-xs text-gray-400 mb-4 pb-4 border-b border-gray-800 flex justify-between">
              <span>Wednesday, 28, 2026</span>
              <span className="flex items-center gap-1"><FiClock /> {order.time}</span>
            </div>

            <div className="flex-1 flex flex-col gap-2 mb-4">
              <div className="flex justify-between text-xs text-gray-500 font-bold mb-1">
                <span>Qty</span> <span className="flex-1 ml-4">Items</span> <span>Price</span>
              </div>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm text-gray-300">
                  <span>01</span> <span className="flex-1 ml-4 truncate">{item.name}</span> <span>${item.price}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mb-6 pt-4 border-t border-gray-800">
              <span className="text-gray-400">SubTotal</span>
              <span className="text-xl font-bold text-white">${order.total}</span>
            </div>

            <div className="grid grid-cols-4 gap-3 mt-auto">
              <button className="col-span-1 py-3 bg-[#1f1d2b] text-[#EA7C69] border border-[#EA7C69]/50 rounded-xl flex justify-center items-center hover:bg-[#EA7C69] hover:text-white transition-colors">
                <FiEdit2 />
              </button>
              <button className="col-span-1 py-3 bg-[#1f1d2b] text-red-500 border border-red-500/50 rounded-xl flex justify-center items-center hover:bg-red-500 hover:text-white transition-colors">
                <FiTrash2 />
              </button>
              <button 
                onClick={() => setShowTipModal(true)}
                className="col-span-2 py-3 bg-[#ffb6c1] text-[#1f1d2b] font-bold rounded-xl hover:bg-white transition-colors shadow-lg"
              >
                Pay Bill
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tip / PIN Modal */}
      {showTipModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#252836] border border-gray-700 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col items-center p-8 animate-fade-in-up relative">
            <button onClick={() => setShowTipModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><FiX size={24} /></button>
            
            <h3 className="text-gray-400 font-medium mb-4">Tips Amount</h3>
            <div className="text-5xl font-bold text-white mb-10 tracking-wider">
              {tipAmount}
            </div>

            <div className="grid grid-cols-3 gap-4 w-full px-4 mb-8">
              {pinPad.map(key => (
                <button 
                  key={key} 
                  onClick={() => handlePinPress(key)}
                  className={`py-4 text-xl font-bold rounded-xl transition-all ${key === 'x' ? 'bg-transparent text-gray-500 hover:bg-gray-800' : 'bg-[#1f1d2b] text-gray-300 hover:bg-[#EA7C69] hover:text-white shadow-md'}`}
                >
                  {key}
                </button>
              ))}
            </div>
            
            <div className="w-full flex justify-between items-center px-4">
              <button className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
                Print Receipt
              </button>
              <button 
                onClick={() => setShowTipModal(false)}
                className="bg-[#ffb6c1] text-[#1f1d2b] px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-white transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
