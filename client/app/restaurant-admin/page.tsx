"use client";

import React from "react";
import { FiTrendingUp, FiShoppingBag, FiUsers, FiDollarSign } from "react-icons/fi";

const stats = [
  { title: "Total Revenue", amount: "$12,426", change: "+32.40%", isUp: true, icon: FiDollarSign, color: "text-green-500", bg: "bg-green-500/10" },
  { title: "Total Dish Ordered", amount: "2,345", change: "-12.40%", isUp: false, icon: FiShoppingBag, color: "text-red-500", bg: "bg-red-500/10" },
  { title: "Total Customers", amount: "1,234", change: "+2.40%", isUp: true, icon: FiUsers, color: "text-blue-500", bg: "bg-blue-500/10" },
];

export default function RestaurantAdminDashboard() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-white">Dashboard Overview</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-[#252836] rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
                <p className="text-2xl font-bold text-white mt-1">{stat.amount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`flex items-center gap-1 ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
                {stat.isUp ? <FiTrendingUp size={14} /> : <FiTrendingUp size={14} className="rotate-180" />}
                {stat.change}
              </span>
              <span className="text-gray-500">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        
        {/* Mock Line Chart */}
        <div className="lg:col-span-2 bg-[#252836] rounded-2xl p-6 border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Revenue Growth</h3>
            <select className="bg-[#1f1d2b] border border-gray-700 text-sm rounded-lg px-3 py-1.5 text-gray-300 focus:outline-none">
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Yearly</option>
            </select>
          </div>
          
          {/* Simple SVG Line Chart Mockup */}
          <div className="h-64 w-full flex items-end gap-2 relative">
            <div className="absolute inset-0 border-b border-l border-gray-700 pointer-events-none" />
            {[40, 60, 45, 80, 55, 90, 75, 100, 85, 110, 95, 120].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                {/* Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-[#ffb6c1] text-[#1f1d2b] text-xs font-bold px-2 py-1 rounded transition-opacity">
                  ${h}k
                </div>
                {/* Bar */}
                <div 
                  className="w-full bg-[#EA7C69] rounded-t-sm opacity-80 group-hover:opacity-100 transition-all duration-300" 
                  style={{ height: `${(h / 120) * 100}%` }}
                />
                <span className="text-[10px] text-gray-500 mt-2">M{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mock Pie Chart */}
        <div className="bg-[#252836] rounded-2xl p-6 border border-gray-800 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Order Distribution</h3>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* CSS Conic Gradient Pie Chart Mock */}
            <div 
              className="w-48 h-48 rounded-full relative flex items-center justify-center shadow-lg"
              style={{
                background: 'conic-gradient(#EA7C69 0% 45%, #9290C3 45% 75%, #FFB534 75% 100%)'
              }}
            >
              <div className="w-32 h-32 bg-[#252836] rounded-full flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">45%</span>
                <span className="text-xs text-gray-400">Dine-in</span>
              </div>
            </div>

            <div className="w-full mt-8 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#EA7C69]"></div>
                  <span className="text-sm text-gray-300">Dine-in</span>
                </div>
                <span className="text-sm text-white font-medium">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#9290C3]"></div>
                  <span className="text-sm text-gray-300">Takeaway</span>
                </div>
                <span className="text-sm text-white font-medium">30%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FFB534]"></div>
                  <span className="text-sm text-gray-300">Delivery</span>
                </div>
                <span className="text-sm text-white font-medium">25%</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
