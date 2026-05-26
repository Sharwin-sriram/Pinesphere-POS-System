'use client';

import React, { useState, useEffect } from 'react';

export default function IncentivesPage() {
 const [incentives, setIncentives] = useState([]);
 const [loading, setLoading] = useState(true);
 const API_BASE = 'http://127.0.0.1:8000/api/hr';

 useEffect(() => {
 fetch(`${API_BASE}/incentives/`)
 .then(res => res.json())
 .then(data => {
 setIncentives(data);
 setLoading(false);
 })
 .catch(err => {
 console.error("Failed to fetch incentives:", err);
 setLoading(false);
 });
 }, []);

 const totalAmount = incentives.reduce((sum: number, inc: any) => sum + parseFloat(inc.amount), 0);
 const salesBonus = incentives.filter((i: any) => i.type === 'Sales').reduce((sum: number, inc: any) => sum + parseFloat(inc.amount), 0);
 const attendanceBonus = incentives.filter((i: any) => i.type === 'Attendance').reduce((sum: number, inc: any) => sum + parseFloat(inc.amount), 0);
 
 return (
 <div className="space-y-6 pb-12">
 <div className="flex justify-between items-center">
 <div>
 <h1 className="text-3xl font-semibold text-gray-900">Incentives & Bonuses</h1>
 <p className="text-gray-500 mt-1">Track and manage employee rewards.</p>
 </div>
 <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition ">
 + Award Incentive
 </button>
 </div>

 {/* Summary Cards */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl text-white">
 <p className="text-green-100 font-medium uppercase tracking-wider text-xs mb-1">Total Awarded</p>
 <p className="text-3xl font-semibold">${totalAmount.toFixed(2)}</p>
 </div>
 <div className="bg-white p-6 rounded-xl border border-gray-100 flex items-center justify-between">
 <div>
 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sales Bonuses</p>
 <p className="text-2xl font-semibold text-gray-900 mt-1">${salesBonus.toFixed(2)}</p>
 </div>
 <div className="text-3xl">🎯</div>
 </div>
 <div className="bg-white p-6 rounded-xl border border-gray-100 flex items-center justify-between">
 <div>
 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance Bonuses</p>
 <p className="text-2xl font-semibold text-gray-900 mt-1">${attendanceBonus.toFixed(2)}</p>
 </div>
 <div className="text-3xl">⏰</div>
 </div>
 </div>

 {/* Main Table */}
 <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
 <div className="p-4 border-b border-gray-100 bg-[var(--color-bg-primary)]">
 <input type="text" placeholder="Search employee..." className="p-2 border border-gray-200 rounded-lg text-sm w-64" />
 </div>
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-[var(--color-bg-primary)]">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Awarded</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200">
 {loading ? <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading incentives...</td></tr> : 
 incentives.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-gray-500">No incentives awarded yet.</td></tr> :
 incentives.map((inc: any) => (
 <tr key={inc.id} className="hover:bg-[var(--color-bg-primary)]">
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="font-semibold text-gray-900">EMP {inc.employee}</div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
 inc.type === 'Sales' ? 'bg-blue-100 text-blue-800' :
 inc.type === 'Attendance' ? 'bg-green-100 text-green-800' :
 inc.type === 'Performance' ? 'bg-purple-100 text-purple-800' :
 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]'
 }`}>
 {inc.type}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">${inc.amount}</td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inc.date_awarded}</td>
 <td className="px-6 py-4 text-sm text-gray-500">{inc.description || '--'}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
}
