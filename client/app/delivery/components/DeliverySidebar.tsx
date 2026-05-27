"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Bike,
  MapPinned,
  BarChart3,
} from "lucide-react";

const links = [
  {
    name: "Dashboard",
    href: "/delivery",
    icon: LayoutDashboard,
  },
  {
    name: "Active Orders",
    href: "/delivery/active-orders",
    icon: Package,
  },
  {
    name: "Riders",
    href: "/delivery/riders",
    icon: Bike,
  },
  {
    name: "Tracking",
    href: "/delivery/tracking",
    icon: MapPinned,
  },
  {
    name: "Analytics",
    href: "/delivery/analytics",
    icon: BarChart3,
  },
];

export default function DeliverySidebar() {
  return (
    <aside className="w-64 bg-[#081028] text-white min-h-screen p-5">
      <h1 className="text-2xl font-bold mb-10">
        PineSphere Delivery
      </h1>

      <div className="space-y-3">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-600 transition"
            >
              <Icon size={20} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}