"use client";

import Link from "next/link";
import {
  FaBoxes,
  FaClipboardList,
  FaExchangeAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

const menuItems = [
  {
    name: "Inventory",
    icon: <FaBoxes />,
    path: "/inventory",
  },
  {
    name: "Purchase Orders",
    icon: <FaClipboardList />,
    path: "/inventory/purchase-orders",
  },
  {
    name: "Stock Transfer",
    icon: <FaExchangeAlt />,
    path: "/inventory/stock-transfer",
  },
  {
    name: "Low Stock",
    icon: <FaExclamationTriangle />,
    path: "/inventory/low-stock",
  },
];

export default function InventorySidebar() {
  return (
    <aside className="w-[260px] bg-[#0f172a] text-white min-h-screen p-5 hidden lg:block">
      <h1 className="text-2xl font-bold mb-10">
        PineSphere Inventory
      </h1>

      <div className="space-y-3">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.path}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1e293b] transition"
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}