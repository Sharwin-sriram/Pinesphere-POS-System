"use client";

import React from "react";
import CategoryList from "../components/dashboard/CategoryList";
import RecommendedFoods from "../components/dashboard/RecommendedFoods";

export default function DashboardPage() {
 return (
 <div className="flex flex-col gap-6 animate-fade-in-up">
 {/* Promotional Banner (Optional for Swiggy-like feel) */}
 <div className="w-full h-48 md:h-64 rounded-ds-3xl bg-[var(--color-blue)] p-6 flex flex-col justify-center text-white overflow-hidden relative group cursor-pointer mt-4">
 <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-250" />
 
 {/* Antigravity floating shapes */}
 <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/20 rounded-full blur-3xl floating-slow" />
 <div className="absolute bottom-[-20%] left-[20%] w-48 h-48 bg-cyan-400/30 rounded-full blur-2xl floating" />

 <div className="relative z-10 max-w-lg">
 <h1 className="text-3xl md:text-5xl font-semibold mb-2">50% OFF</h1>
 <p className="text-lg md:text-xl font-medium mb-4 opacity-90">On your first order! Explore the best meals near you.</p>
 <button className="bg-white text-blue-600 px-6 py-2 rounded-ds-md font-semibold hover:scale-105 transition-smooth w-max">
 Order Now
 </button>
 </div>
 </div>

 <CategoryList />
 
 <RecommendedFoods />
 </div>
 );
}
