"use client";

import Link from "next/link";

export default function RestaurantAdminSidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900">Restaurant Admin</h2>
      </div>

      <nav className="px-3 py-4 space-y-2">
        <Link
          href="/restaurant-admin"
          className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
        >
          Dashboard
        </Link>
        <Link
          href="/restaurant-admin/franschise"
          className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
        >
          Franchise
        </Link>
        <Link
          href="/restaurant-admin/inventory"
          className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
        >
          Inventory
        </Link>
        <Link
          href="/restaurant-admin/orders"
          className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
        >
          Orders
        </Link>
        <Link
          href="/restaurant-admin/reservation"
          className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
        >
          Reservations
        </Link>
        <Link
          href="/restaurant-admin/staff"
          className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
        >
          Staff
        </Link>
        <Link
          href="/restaurant-admin/settings"
          className="block px-4 py-2 text-blue-600 bg-blue-50 rounded-lg font-medium"
        >
          Settings
        </Link>
      </nav>
    </aside>
  );
}
