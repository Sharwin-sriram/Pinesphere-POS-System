"use client";

import { Menu, Search, ShoppingCart, Star } from "lucide-react";
import React from "react";

import { useCart } from "./CartContext";

interface TopbarProps {
 onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
 const { cartCount } = useCart();

 return (
 <header className="sticky top-0 z-30 w-full glass-light border-b border-white/40">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
 
 {/* Left Side: Menu Toggle and Cart */}
 <div className="flex items-center gap-4">
 <button 
 onClick={onMenuClick}
 className="p-2 bg-white/60 hover:bg-white rounded-xl transition-all text-gray-700"
 >
 <Menu className="h-4 w-4" strokeWidth={1.5} />
 </button>
 
 <button className="relative p-2 bg-gradient-to-tr from-blue-500 to-cyan-400 text-white rounded-xl hover: transform hover:-translate-y-0.5 transition-all">
 <ShoppingCart className="h-4 w-4" strokeWidth={1.5} />
 {cartCount > 0 && (
 <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full border-2 border-white animate-bounce-light">
 {cartCount}
 </span>
 )}
 </button>
 </div>

 {/* Center: Global Search */}
 <div className="hidden sm:flex flex-1 max-w-2xl ml-4">
 <div className="relative group w-full">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <Search className="text-gray-400 group-focus-within:text-blue-500 transition-colors h-4 w-4" strokeWidth={1.5} />
 </div>
 <input 
 type="text" 
 placeholder="Search for restaurants, cuisines, or dishes..." 
 className="w-full bg-white/70 border border-white/60 rounded-2xl pl-12 pr-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all "
 />
 </div>
 </div>

 {/* Right Side: Subscribe Button & Profile */}
 <div className="flex items-center gap-4">
 <button className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-semibold hover: hover:scale-105 transition-all">
 <Star className="h-4 w-4" strokeWidth={1.5} />
 Subscribe
 </button>
 
 <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold cursor-pointer hover: transition-all">
 U
 </div>
 </div>
 </div>
 </header>
 );
}
