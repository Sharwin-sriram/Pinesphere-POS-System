"use client";

import { User } from "lucide-react";
import React from "react";


export default function WaiterAccountPage() {
 return (
 <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-fade-in-up">
 <div className="w-24 h-24 card-light flex items-center justify-center mb-6 text-blue-500 rounded-full">
 <User className="h-4 w-4" strokeWidth={1.5} />
 </div>
 <h2 className="text-3xl font-semibold text-[var(--color-text-primary)] mb-4">My Account</h2>
 <p className="text-gray-500 max-w-md">
 View your shift details, performance metrics, and profile settings here.
 </p>
 
 <button className="mt-8 bg-[var(--color-blue)] text-white px-6 py-3 rounded-ds-md font-semibold hover:-translate-y-1 transition-smooth" style={{border:'none'}}>
 Edit Profile
 </button>
 </div>
 );
}
