"use client";

import { Activity, Briefcase, DollarSign, TrendingUp, User, Users } from "lucide-react";
import React from "react";


const stats = [
 { title: "Total Platform Revenue", amount: "$1,245,600", change: "+15.4%", isUp: true, icon: DollarSign, color: "text-green-500", bg: "bg-green-100" },
 { title: "Active Restaurants", amount: "342", change: "+12", isUp: true, icon: Briefcase, color: "text-blue-500", bg: "bg-blue-100" },
 { title: "Total Users", amount: "45,211", change: "+2.4%", isUp: true, icon: Users, color: "text-purple-500", bg: "bg-purple-100" },
 { title: "System Health", amount: "99.9%", change: "Stable", isUp: true, icon: Activity, color: "text-cyan-500", bg: "bg-cyan-100" },
];

export default function SuperAdminDashboard() {
 return (
 <div className="flex flex-col gap-6 animate-fade-in-up">
 <div className="flex justify-between items-center mb-2">
 <div>
 <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Platform Overview</h2>
 <p className="text-sm text-gray-500">Welcome back, Super Admin</p>
 </div>
 <button className="bg-gradient-to-tr from-blue-500 to-cyan-400 text-white px-4 py-2 rounded-xl font-semibold hover: hover:-translate-y-0.5 transition-all text-sm">
 Download Global Report
 </button>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {stats.map((stat, idx) => (
 <div key={idx} className="card-light !p-6 flex flex-col justify-between hover:-translate-y-1 hover: transition-all duration-150">
 <div className="flex items-center gap-4 mb-4">
 <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
 <stat.icon size={24} />
 </div>
 <div>
 <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
 <p className="text-2xl font-semibold text-[var(--color-text-primary)] mt-1">{stat.amount}</p>
 </div>
 </div>
 <div className="flex items-center gap-2 text-sm">
 <span className={`flex items-center gap-1 font-semibold ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
 {stat.isUp ? <TrendingUp className="h-4 w-4" strokeWidth={1.5} /> : <TrendingUp className="h-4 w-4 rotate-180" strokeWidth={1.5} />}
 {stat.change}
 </span>
 <span className="text-gray-400">vs last month</span>
 </div>
 </div>
 ))}
 </div>

 {/* Placeholder for complex charts / logs */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
 <div className="lg:col-span-2 card-light !p-6 flex flex-col items-center justify-center min-h-[300px]">
 <Activity className="h-4 w-4 text-gray-300 mb-4" strokeWidth={1.5} />
 <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Platform Activity Graph</h3>
 <p className="text-gray-500 text-sm">Detailed telemetry will be connected soon.</p>
 </div>
 <div className="card-light !p-6 flex flex-col min-h-[300px]">
 <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Recent Alerts</h3>
 <div className="flex-1 flex flex-col gap-3">
 {[1, 2, 3].map(i => (
 <div key={i} className="bg-white/50 border border-gray-100 p-3 rounded-xl flex gap-3">
 <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5" />
 <div>
 <p className="text-sm font-semibold text-gray-700">High API latency detected</p>
 <p className="text-xs text-gray-500">Server US-East-1 • 10 mins ago</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}
