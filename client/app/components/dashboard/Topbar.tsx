"use client";

import React from "react";
import { FiMenu, FiShoppingCart, FiSearch, FiStar } from "react-icons/fi";
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
            className="p-2 bg-white/60 hover:bg-white rounded-xl shadow-sm transition-all text-gray-700"
          >
            <FiMenu size={24} />
          </button>
          
          <button className="relative p-2 bg-gradient-to-tr from-blue-500 to-cyan-400 text-white rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
            <FiShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white animate-bounce-light">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Center: Global Search */}
        <div className="hidden sm:flex flex-1 max-w-2xl ml-4">
          <div className="relative group w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search for restaurants, cuisines, or dishes..." 
              className="w-full bg-white/70 border border-white/60 rounded-2xl pl-12 pr-4 py-3 text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Right Side: Subscribe Button & Profile */}
        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all">
            <FiStar size={16} />
            Subscribe
          </button>
          
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:shadow-lg transition-all">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
