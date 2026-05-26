"use client";

import React from "react";
import { FiUser } from "react-icons/fi";

export default function WaiterAccountPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-fade-in-up">
      <div className="w-24 h-24 card-light flex items-center justify-center mb-6 shadow-md text-blue-500 rounded-full">
        <FiUser size={48} />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">My Account</h2>
      <p className="text-gray-500 max-w-md">
        View your shift details, performance metrics, and profile settings here.
      </p>
      
      <button className="mt-8 bg-gradient-to-tr from-blue-500 to-cyan-400 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
        Edit Profile
      </button>
    </div>
  );
}
