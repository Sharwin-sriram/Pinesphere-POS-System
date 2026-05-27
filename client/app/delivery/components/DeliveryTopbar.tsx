"use client";

import { Bell, Search } from "lucide-react";

export default function DeliveryTopbar() {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-xl w-[350px]">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search deliveries..."
          className="bg-transparent outline-none w-full"
        />
      </div>

      <div className="flex items-center gap-4">
        <Bell />

        <div className="text-right">
          <p className="font-semibold">
            Admin User
          </p>

          <p className="text-sm text-gray-500">
            Delivery Manager
          </p>
        </div>

        <div className="w-10 h-10 rounded-full bg-blue-500" />
      </div>
    </div>
  );
}