'use client';

import React, { useState, useEffect } from 'react';

export default function PayrollPage() {
 const [payrolls, setPayrolls] = useState([]);
 const [loading, setLoading] = useState(true);
 const API_BASE = 'http://127.0.0.1:8000/api/hr';

 useEffect(() => {
 fetch(`${API_BASE}/payroll/`)
 .then(res => res.json())
 .then(data => {
 setPayrolls(data);
 setLoading(false);
 })
 .catch(err => {
 console.error("Failed to fetch payroll:", err);
 setLoading(false);
 });
 }, []);

 // Compute summary stats
 const totalPayroll = payrolls.reduce((sum: number, p: any) => sum + parseFloat(p.net_salary), 0);
 const pendingSalary = payrolls.filter((p: any) => p.status === 'Pending').reduce((sum: number, p: any) => sum + parseFloat(p.net_salary), 0);
 const bonusGiven = payrolls.reduce((sum: number, p: any) => sum + parseFloat(p.bonuses), 0);

 return (
 <div className="space-y-6">
 <div className="flex justify-between items-center">
 <h1 className="text-3xl font-semibold text-gray-900">Payroll & Salary</h1>
 <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
 Process Run
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 <div className="bg-white p-6 rounded-xl border border-gray-100">
 <p className="text-sm font-medium text-gray-500">Total Payroll</p>
 <p className="text-2xl font-semibold text-gray-900 mt-2">${totalPayroll.toFixed(2)}</p>
 </div>
 <div className="bg-white p-6 rounded-xl border border-gray-100">
 <p className="text-sm font-medium text-gray-500">Pending Salary</p>
 <p className="text-2xl font-semibold text-yellow-600 mt-2">${pendingSalary.toFixed(2)}</p>
 </div>
 <div className="bg-white p-6 rounded-xl border border-gray-100">
 <p className="text-sm font-medium text-gray-500">Bonus Given</p>
 <p className="text-2xl font-semibold text-green-600 mt-2">${bonusGiven.toFixed(2)}</p>
 </div>
 <div className="bg-white p-6 rounded-xl border border-gray-100">
 <p className="text-sm font-medium text-gray-500">Deductions</p>
 <p className="text-2xl font-semibold text-red-600 mt-2">$0.00</p>
 </div>
 </div>

 <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-[var(--color-bg-primary)]">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonuses</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200">
 {loading ? <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr> : 
 payrolls.length === 0 ? <tr><td colSpan={6} className="p-4 text-center text-gray-500">No payroll records found.</td></tr> :
 payrolls.map((rec: any) => (
 <tr key={rec.id} className="hover:bg-[var(--color-bg-primary)]">
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="font-medium text-gray-900">{rec.employee_details?.first_name} {rec.employee_details?.last_name}</div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.month}/{rec.year}</td>
 <td className="px-6 py-4 whitespace-nowrap font-medium">${rec.net_salary}</td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+${rec.bonuses}</td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
 rec.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
 }`}>
 {rec.status}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
 <button className="text-blue-600 hover:text-blue-900">Download</button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
}
