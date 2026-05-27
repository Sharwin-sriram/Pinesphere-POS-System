"use client";

import {
  Bike,
  PackageCheck,
  PackageX,
  Clock3,
} from "lucide-react";

const stats = [
  {
    title: "Active Deliveries",
    value: "48",
    icon: Bike,
  },
  {
    title: "Delivered Today",
    value: "124",
    icon: PackageCheck,
  },
  {
    title: "Failed Deliveries",
    value: "6",
    icon: PackageX,
  },
  {
    title: "Avg Delivery Time",
    value: "22 mins",
    icon: Clock3,
  },
];

export default function DeliveryStatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="bg-white p-5 rounded-2xl shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">
                  {stat.title}
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {stat.value}
                </h2>
              </div>

              <div className="bg-blue-100 p-3 rounded-xl">
                <Icon className="text-blue-600" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}