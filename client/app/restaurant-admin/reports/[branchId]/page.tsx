"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const weeklyData = [
  { day: 'Mon', revenue: 4000, orders: 120 },
  { day: 'Tue', revenue: 3000, orders: 98 },
  { day: 'Wed', revenue: 5500, orders: 165 },
  { day: 'Thu', revenue: 4800, orders: 140 },
  { day: 'Fri', revenue: 8000, orders: 250 },
  { day: 'Sat', revenue: 9500, orders: 310 },
  { day: 'Sun', revenue: 8500, orders: 280 },
];

export default function BranchReportPage() {
  const params = useParams();
  const router = useRouter();
  const branchId = params.branchId as string;

  // Mock mapping of id to name just for display
  const branchNames: Record<string, string> = {
    'b1': 'Downtown Branch',
    'b2': 'Westside Mall',
    'b3': 'Airport Kiosk',
    'b4': 'Central Station',
    'b5': 'Northpark Ave'
  };

  const branchName = branchNames[branchId] || `Branch ${branchId}`;

  return (
    <div className="min-h-screen bg-[var(--color-bg-tertiary)] p-8 animate-fade-in-up">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-10 flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-white rounded-full shadow hover:bg-gray-50 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-4xl font-semibold text-gray-800">{branchName} Report</h1>
            <p className="text-[var(--color-text-secondary)] mt-1">Detailed performance metrics for this location</p>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <span className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-2">Weekly Revenue</span>
            <span className="text-4xl font-bold text-blue-600">$43,300</span>
            <span className="text-green-500 text-sm font-semibold mt-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              +12.5% from last week
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <span className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-2">Total Orders</span>
            <span className="text-4xl font-bold text-emerald-500">1,363</span>
            <span className="text-green-500 text-sm font-semibold mt-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              +8.2% from last week
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <span className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-2">Customer Satisfaction</span>
            <span className="text-4xl font-bold text-orange-500">4.8 / 5.0</span>
            <span className="text-gray-500 text-sm font-semibold mt-2 flex items-center gap-1">
              Based on 450 reviews
            </span>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* REVENUE TREND */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Revenue Trend</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ORDERS TREND */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Order Volume</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
