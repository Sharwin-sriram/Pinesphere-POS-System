"use client";

import React from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

// Mock Data
const revenueData = [
  { name: 'Downtown Branch', revenue: 45000 },
  { name: 'Westside Mall', revenue: 38000 },
  { name: 'Airport Kiosk', revenue: 22000 },
  { name: 'Central Station', revenue: 52000 },
];

const categoryData = [
  { name: 'Dine-in', value: 400 },
  { name: 'Takeaway', value: 300 },
  { name: 'Delivery', value: 300 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const mockBranches = [
  { id: 'b1', name: 'Downtown Branch', status: 'ACTIVE', revenue: '$45,000', orders: 1200 },
  { id: 'b2', name: 'Westside Mall', status: 'ACTIVE', revenue: '$38,000', orders: 950 },
  { id: 'b3', name: 'Airport Kiosk', status: 'ACTIVE', revenue: '$22,000', orders: 600 },
  { id: 'b4', name: 'Central Station', status: 'ACTIVE', revenue: '$52,000', orders: 1400 },
  { id: 'b5', name: 'Northpark Ave', status: 'INACTIVE', revenue: '$0', orders: 0 },
];

export default function ReportsDashboard() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-tertiary)] p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-10">
          <h1 className="text-5xl font-semibold mb-3">Overall Reports</h1>
          <p className="text-[var(--color-text-secondary)] text-lg">System-wide analytics and branch performance</p>
        </div>

        {/* CHARTS SECTION */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          
          {/* BAR CHART */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Branch Revenue Comparison</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                  <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PIE CHART */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Order Channels</h2>
            <div className="h-80 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CURRENT BRANCHES */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-3xl font-semibold mb-8 text-gray-800">Current Branches</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockBranches.map((branch) => (
              <Link 
                href={`/restaurant-admin/reports/${branch.id}`} 
                key={branch.id}
                className="block border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-blue-300 hover:-translate-y-1 transition-all group bg-gray-50 hover:bg-white"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{branch.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    branch.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {branch.status}
                  </span>
                </div>
                
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Monthly Revenue:</span>
                    <span className="font-bold text-gray-800">{branch.revenue}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Total Orders:</span>
                    <span className="font-bold text-gray-800">{branch.orders}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center text-blue-600 font-semibold text-sm group-hover:text-blue-700">
                  View Detailed Report 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
