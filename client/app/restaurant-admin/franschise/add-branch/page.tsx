"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function AddBranchPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    managerName: "",
    contact: "",
    status: "ACTIVE"
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Fake API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success("Branch added successfully!");
      
      setTimeout(() => {
        router.push("/restaurant-admin/franschise");
      }, 1000);

    } catch (error) {
      toast.error("Failed to add branch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-tertiary)] p-8">
      <Toaster position="top-right" />
      <div className="max-w-3xl mx-auto">
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
            <h1 className="text-4xl font-semibold">Add New Branch</h1>
            <p className="text-[var(--color-text-secondary)] mt-1">Register a new franchise location</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Branch Name</label>
              <input 
                type="text" 
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Downtown Springfield"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Location / Address</label>
              <input 
                type="text" 
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="Full address"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Manager Name</label>
              <input 
                type="text" 
                name="managerName"
                required
                value={formData.managerName}
                onChange={handleChange}
                placeholder="Full name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Contact Number</label>
              <input 
                type="text" 
                name="contact"
                required
                value={formData.contact}
                onChange={handleChange}
                placeholder="+1 234 567 890"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Initial Status</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-white"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive (Setting up)</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
