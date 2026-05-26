"use client";

import { Package } from "lucide-react";
import React from "react";


export default function InventoryPage() {
 return (
 <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-fade-in-up">
 <div className="w-24 h-24 card-light flex items-center justify-center mb-6 text-blue-500 rounded-full">
 <Package className="h-4 w-4" strokeWidth={1.5} />
 </div>
 <h2 className="text-3xl font-semibold text-[var(--color-text-primary)] mb-4">Inventory Management</h2>
 <p className="text-gray-500 max-w-md">
 Track your ingredients, raw materials, and stock levels here.
 </p>
 
 <button className="mt-8 bg-gradient-to-tr from-blue-500 to-cyan-400 text-white px-6 py-3 rounded-xl font-semibold hover: hover:-translate-y-1 transition-all">
 + Manage Inventory
 </button>
 </div>
 );
}
