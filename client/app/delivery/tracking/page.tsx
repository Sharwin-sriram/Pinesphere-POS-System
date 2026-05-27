"use client";

import { useState } from "react";

import DeliverySidebar from "../components/DeliverySidebar";
import DeliveryTopbar from "../components/DeliveryTopbar";
import DeliveryMap from "../components/DeliveryMap";
import DeliveryTimeline from "../components/DeliveryTimeline";
import OTPVerificationModal from "../components/OTPVerificationModal";
import RouteOptimizationPanel from "../components/RouteOptimizationPanel";

export default function TrackingPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex bg-[#f5f7fb] min-h-screen">
      <DeliverySidebar />

      <main className="flex-1 p-6">
        <DeliveryTopbar />

        <div className="flex items-center justify-between mt-6">
          <div>
            <h1 className="text-3xl font-bold">
              Live Delivery Tracking
            </h1>

            <p className="text-gray-500 mt-1">
              Monitor all active deliveries in realtime
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="bg-blue-600 text-white px-5 py-3 rounded-xl"
          >
            Verify Delivery OTP
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
          <div className="xl:col-span-2">
            <DeliveryMap />
          </div>

          <div>
            <RouteOptimizationPanel />
          </div>
        </div>

        <div className="mt-6">
          <DeliveryTimeline />
        </div>

        <OTPVerificationModal
          isOpen={open}
          onClose={() => setOpen(false)}
        />
      </main>
    </div>
  );
}