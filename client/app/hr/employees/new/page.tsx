'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddEmployeeForm() {
 const router = useRouter();
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 
 const [formData, setFormData] = useState({
 first_name: '',
 last_name: '',
 role: 'Waiter',
 department: 'Service',
 branch: 'Main',
 phone: '',
 emergency_contact: '',
 base_salary: '0.00',
 });

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
 setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError(null);
 
 try {
 const res = await fetch('http://127.0.0.1:8000/api/hr/employees/', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 ...formData,
 is_active: true
 })
 });
 
 if (res.ok) {
 router.push('/hr/employees');
 } else {
 const errData = await res.json();
 setError(JSON.stringify(errData));
 }
 } catch (err) {
 console.error(err);
 setError("Failed to connect to the server.");
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="max-w-3xl mx-auto space-y-6 pb-12">
 <div className="flex items-center gap-4 mb-8">
 <Link href="/hr/employees" className="text-gray-500 hover:text-gray-900 transition flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-100">
 ←
 </Link>
 <div>
 <h1 className="text-3xl font-semibold text-gray-900">Add New Employee</h1>
 <p className="text-gray-500 mt-1">Enter the details to onboard a new staff member.</p>
 </div>
 </div>

 {error && (
 <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
 <strong>Error: </strong> {error}
 </div>
 )}

 <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-100 space-y-8">
 
 {/* Personal Details */}
 <div>
 <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Personal Details</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
 <input required name="first_name" value={formData.first_name} onChange={handleChange} type="text" className="w-full p-3 border border-gray-200 rounded-xl bg-[var(--color-bg-primary)] focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="John" />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
 <input required name="last_name" value={formData.last_name} onChange={handleChange} type="text" className="w-full p-3 border border-gray-200 rounded-xl bg-[var(--color-bg-primary)] focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Doe" />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
 <input name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full p-3 border border-gray-200 rounded-xl bg-[var(--color-bg-primary)] focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="+1 234 567 8900" />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
 <input name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} type="tel" className="w-full p-3 border border-gray-200 rounded-xl bg-[var(--color-bg-primary)] focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="+1 987 654 3210" />
 </div>
 </div>
 </div>

 {/* Work Details */}
 <div>
 <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Employment Details</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
 <select name="role" value={formData.role} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl bg-[var(--color-bg-primary)] focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition">
 <option value="Manager">Manager</option>
 <option value="Cashier">Cashier</option>
 <option value="Waiter">Waiter</option>
 <option value="Chef">Chef</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
 <select name="department" value={formData.department} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl bg-[var(--color-bg-primary)] focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition">
 <option value="Service">Service</option>
 <option value="Kitchen">Kitchen</option>
 <option value="Management">Management</option>
 <option value="Admin">Admin</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Branch *</label>
 <input required name="branch" value={formData.branch} onChange={handleChange} type="text" className="w-full p-3 border border-gray-200 rounded-xl bg-[var(--color-bg-primary)] focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Main Branch" />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Base Salary (per month) *</label>
 <div className="relative">
 <span className="absolute left-4 top-3.5 text-gray-500">$</span>
 <input required name="base_salary" value={formData.base_salary} onChange={handleChange} type="number" step="0.01" className="w-full p-3 pl-8 border border-gray-200 rounded-xl bg-[var(--color-bg-primary)] focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
 </div>
 </div>
 </div>
 </div>

 <div className="pt-4 flex justify-end gap-4">
 <Link href="/hr/employees" className="px-6 py-3 text-gray-700 font-medium hover:bg-[var(--color-bg-tertiary)] rounded-xl transition">
 Cancel
 </Link>
 <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
 {loading ? 'Saving...' : 'Save Employee'}
 </button>
 </div>

 </form>
 </div>
 );
}
