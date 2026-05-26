"use client";

import React from "react";
import Link from "next/link";
import { FiX, FiSettings, FiSearch, FiHome, FiUser } from "react-icons/fi";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-white/90 backdrop-blur-xl border-r border-white/50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold gradient-text-light">Pinesphere</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiX size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {/* Menu Items */}
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-50 transition-colors group">
            <FiHome size={20} className="text-gray-500 group-hover:text-blue-500" />
            <span className="font-medium text-gray-700 group-hover:text-blue-600">Home</span>
          </Link>
          
          <Link href="/dashboard/restaurants" onClick={onClose} className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-50 transition-colors group">
            <FiSearch size={20} className="text-gray-500 group-hover:text-blue-500" />
            <span className="font-medium text-gray-700 group-hover:text-blue-600">Search Restaurants</span>
          </Link>

          <Link href="/account" onClick={onClose} className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-50 transition-colors group">
            <FiUser size={20} className="text-gray-500 group-hover:text-blue-500" />
            <span className="font-medium text-gray-700 group-hover:text-blue-600">My Account</span>
          </Link>

          <Link href="/settings" onClick={onClose} className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-50 transition-colors group">
            <FiSettings size={20} className="text-gray-500 group-hover:text-blue-500" />
            <span className="font-medium text-gray-700 group-hover:text-blue-600">Account Settings</span>
          </Link>
        </div>
        
        <div className="p-6 border-t border-gray-200">
          <button className="w-full btn-secondary-light text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 font-semibold">
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
