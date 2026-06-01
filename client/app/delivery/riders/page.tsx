"use client";

import { useEffect, useState } from "react";
import RiderCard from "../components/RiderCard";
import { deliveryApi } from "../services/delivery.service";

export default function RidersPage() {
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRiders() {
      try {
        const data = await deliveryApi.getRiders();
        setRiders(data);
      } catch (error) {
        console.error("Failed to load riders:", error);
      } finally {
        setLoading(false);
      }
    }
    loadRiders();
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Riders Management</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Manage and monitor all delivery riders</p>
        </div>
        <button className="btn-light px-5 py-2">
          Add Rider
        </button>
      </div>

      {loading ? (
        <div className="text-[var(--color-text-secondary)]">Loading riders...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {riders.map((rider) => (
            <RiderCard
              key={rider.id}
              rider={{
                id: rider.id,
                name: rider.name,
                phone: rider.phone,
                status: rider.status === "available" ? "Online" : rider.status === "busy" ? "Delivering" : "Offline",
                vehicle: rider.vehicle_type || "Unknown",
                earnings: 0, // Mock for now
                deliveries: 0, // Mock for now
                rating: 4.5, // Mock for now
                currentLatitude: 0,
                currentLongitude: 0,
              }}
            />
          ))}
          {riders.length === 0 && (
            <div className="col-span-full text-center text-[var(--color-text-muted)] py-10">
              No riders found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
