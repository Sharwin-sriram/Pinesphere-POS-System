"use client";

import React from "react";
import { FiUsers } from "react-icons/fi";

export default function StaffPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-fade-in-up">
      <div className="w-24 h-24 bg-[#252836] rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,182,193,0.1)] text-[#EA7C69]">
        <FiUsers size={48} />
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">Staff Management</h2>
      <p className="text-gray-400 max-w-md">
        This is where you can manage your restaurant's staff attendance, roles, and shifts. Content will be added here soon.
      </p>
      
      <button className="mt-8 bg-[#ffb6c1] text-[#1f1d2b] px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-white transition-colors">
        + Add New Staff
      </button>
    </div>
  );
}
