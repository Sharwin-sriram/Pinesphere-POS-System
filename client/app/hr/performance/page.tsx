'use client';

import React, { useState, useEffect } from 'react';

export default function PerformancePage() {
 const [performances, setPerformances] = useState([]);
 const [loading, setLoading] = useState(true);
 const API_BASE = 'http://127.0.0.1:8000/api/hr';

 useEffect(() => {
 fetch(`${API_BASE}/performance/`)
 .then(res => res.json())
 .then(data => {
 setPerformances(data);
 setLoading(false);
 })
 .catch(err => {
 console.error("Failed to fetch performance:", err);
 setLoading(false);
 });
 }, []);

 return (
 <div className="space-y-6">
 <div className="flex justify-between items-center">
 <h1 className="text-3xl font-semibold text-gray-900">Performance Dashboard</h1>
 <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
 Generate Report
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-xl text-white">
 <p className="text-blue-100 font-medium">🏆 Top Employee</p>
 <p className="text-2xl font-semibold mt-2">Alex Johnson</p>
 <p className="text-sm text-blue-200 mt-1">Overall Rating: 4.9/5</p>
 </div>
 <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-xl text-white">
 <p className="text-green-100 font-medium">🥇 Best Waiter</p>
 <p className="text-2xl font-semibold mt-2">Sarah Smith</p>
 <p className="text-sm text-green-200 mt-1">Customer Rating: 4.8/5</p>
 </div>
 <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-xl text-white">
 <p className="text-purple-100 font-medium">⏱️ Most Punctual</p>
 <p className="text-2xl font-semibold mt-2">Michael Brown</p>
 <p className="text-sm text-purple-200 mt-1">Late Arrivals: 0</p>
 </div>
 </div>

 <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-[var(--color-bg-primary)]">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200">
 {loading ? <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr> : 
 performances.length === 0 ? <tr><td colSpan={4} className="p-4 text-center text-gray-500">No performance records found.</td></tr> :
 performances.map((rec: any) => (
 <tr key={rec.id} className="hover:bg-[var(--color-bg-primary)]">
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="font-medium text-gray-900">{rec.employee_details?.first_name} {rec.employee_details?.last_name}</div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.month}/{rec.year}</td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="flex items-center gap-2">
 <span className="font-semibold text-gray-900">{rec.rating}</span>
 <span className="text-yellow-400">★</span>
 </div>
 </td>
 <td className="px-6 py-4 text-sm text-gray-500">{rec.comments || '--'}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
}
