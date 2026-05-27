"use client";

import DeliverySidebar from "../components/DeliverySidebar";
import DeliveryTopbar from "../components/DeliveryTopbar";
import RiderCard from "../components/RiderCard";
import { riders } from "../data/mockData";

export default function RidersPage() {
  return (
    <div className="flex bg-[#f5f7fb] min-h-screen">
      <DeliverySidebar />

      <main className="flex-1 p-6">
        <DeliveryTopbar />

        <div className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">
              Riders Management
            </h1>

            <button className="bg-blue-600 text-white px-5 py-2 rounded-xl">
              Add Rider
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {riders.map((rider) => (
              <RiderCard
                key={rider.id}
                rider={rider}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}