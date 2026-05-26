"use client";

import { Check, CheckCircle, Clock, Pencil, Trash2, X } from "lucide-react";
import React, { useState } from "react";


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
 <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
 {tabs.map(tab => (
 <button 
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeTab === tab ? "bg-gradient-to-tr from-blue-500 to-cyan-400 text-white " : "text-gray-500 hover:text-[var(--color-text-primary)] hover:bg-white"}`}
 >
 {tab}
 </button>
 ))}
 <button className="ml-auto bg-white hover:bg-[var(--color-bg-primary)] text-blue-600 px-4 py-2 rounded-lg font-semibold transition-all border border-gray-200 ">
 + Add New Order
 </button>
 </div>

 {/* Orders Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
 {mockOrders.map(order => (
 <div key={order.id} className="card-light !p-5 flex flex-col hover:border-blue-400 transition-colors">
 <div className="flex justify-between items-start mb-4">
 <div className="flex items-center gap-4">
 <div className={`w-12 h-12 flex items-center justify-center rounded-xl text-xl font-semibold ${order.status === 'Ready' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
 {order.id}
 </div>
 <div>
 <h3 className="text-[var(--color-text-primary)] font-semibold">{order.name}</h3>
 <p className="text-xs text-gray-500">Order # {order.orderNo}</p>
 </div>
 </div>
 <div className="flex flex-col items-end">
 <span className={`text-xs px-2 py-1 rounded font-semibold mb-1 flex items-center gap-1 ${order.status === 'Ready' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
 <CheckCircle /> {order.status}
 </span>
 <span className="text-[10px] text-gray-400 flex items-center gap-1">
 <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'Ready' ? 'bg-green-500' : 'bg-orange-500'}`} />
 {order.subStatus}
 </span>
 </div>
 </div>
 
 <div className="text-xs text-gray-500 mb-4 pb-4 border-b border-gray-200 flex justify-between">
 <span>Wednesday, 28, 2026</span>
 <span className="flex items-center gap-1 font-medium"><Clock /> {order.time}</span>
 </div>

 <div className="flex-1 flex flex-col gap-2 mb-4">
 <div className="flex justify-between text-xs text-gray-400 font-semibold mb-1">
 <span>Qty</span> <span className="flex-1 ml-4">Items</span> <span>Price</span>
 </div>
 {order.items.map((item, idx) => (
 <div key={idx} className="flex justify-between text-sm text-gray-700 font-medium">
 <span className="text-gray-500">01</span> <span className="flex-1 ml-4 truncate">{item.name}</span> <span>${item.price}</span>
 </div>
 ))}
 </div>

 <div className="flex justify-between items-center mb-6 pt-4 border-t border-gray-200">
 <span className="text-gray-500 font-medium">SubTotal</span>
 <span className="text-xl font-semibold text-[var(--color-text-primary)]">${order.total}</span>
 </div>

 <div className="grid grid-cols-4 gap-3 mt-auto">
 <button className="col-span-1 py-3 bg-white text-blue-500 border border-blue-200 rounded-xl flex justify-center items-center hover:bg-blue-50 transition-colors ">
 <Pencil />
 </button>
 <button className="col-span-1 py-3 bg-white text-red-500 border border-red-200 rounded-xl flex justify-center items-center hover:bg-red-50 transition-colors ">
 <Trash2 />
 </button>
 <button 
 onClick={() => setShowTipModal(true)}
 className="col-span-2 py-3 bg-gradient-to-tr from-blue-500 to-cyan-400 text-white font-semibold rounded-xl hover: transition-all "
 >
 Pay Bill
 </button>
 </div>
 </div>
 ))}
 </div>

 {/* Tip / PIN Modal */}
 {showTipModal && (
 <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center p-4">
 <div className="card-light border-0 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col items-center p-8 animate-fade-in-up relative">
 <button onClick={() => setShowTipModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-[var(--color-text-primary)]"><X className="h-4 w-4" strokeWidth={1.5} /></button>
 
 <h3 className="text-gray-500 font-semibold mb-4">Tips Amount</h3>
 <div className="text-5xl font-semibold text-[var(--color-text-primary)] mb-10 tracking-wider">
 {tipAmount}
 </div>

 <div className="grid grid-cols-3 gap-4 w-full px-4 mb-8">
 {pinPad.map(key => (
 <button 
 key={key} 
 onClick={() => handlePinPress(key)}
 className={`py-4 text-xl font-semibold rounded-xl transition-all ${key === 'x' ? 'bg-transparent text-gray-400 hover:bg-[var(--color-bg-tertiary)]' : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-100'}`}
 >
 {key}
 </button>
 ))}
 </div>
 
 <div className="w-full flex justify-between items-center px-4">
 <button className="text-gray-500 hover:text-[var(--color-text-primary)] text-sm font-semibold transition-colors">
 Print Receipt
 </button>
 <button 
 onClick={() => setShowTipModal(false)}
 className="bg-gradient-to-tr from-blue-500 to-cyan-400 text-white px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-all"
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
