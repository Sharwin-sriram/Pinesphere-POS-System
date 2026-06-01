"use client";

import { useState } from "react";
import DeliveryMap from "../components/DeliveryMap";
import DeliveryTimeline from "../components/DeliveryTimeline";
import OTPVerificationModal from "../components/OTPVerificationModal";
import RouteOptimizationPanel from "../components/RouteOptimizationPanel";

export default function TrackingPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            Live Delivery Tracking
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Monitor all active deliveries in realtime
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="btn-light px-5 py-2"
        >
          Verify Delivery OTP
        </button>
      </div>

      {/* Map + Route panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <DeliveryMap />
        </div>
        <div>
          <RouteOptimizationPanel />
        </div>
      </div>

      {/* Timeline */}
      <DeliveryTimeline />

      <OTPVerificationModal
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}