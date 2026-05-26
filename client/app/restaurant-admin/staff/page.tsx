"use client";

import React from "react";
import { FiUsers } from "react-icons/fi";

export default function StaffPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-fade-in-up">
      <div className="w-24 h-24 card-light flex items-center justify-center mb-6 shadow-md text-blue-500 rounded-full">
        <FiUsers size={48} />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Staff Management</h2>
      <p className="text-gray-500 max-w-md">
        This is where you can manage your restaurant's staff attendance, roles, and shifts. Content will be added here soon.
      </p>
      
      <button className="mt-8 bg-gradient-to-tr from-blue-500 to-cyan-400 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
        + Add New Staff
      </button>
    </div>
  );
}
