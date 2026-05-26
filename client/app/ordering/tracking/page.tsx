// ordering/tracking/page.tsx

"use client";

import DeliveryPartnerCard from "../components/DeliveryPartnerCard";
import DeliveryTimeline from "../components/DeliveryTimeline";
import DeliveryTracker from "../components/DeliveryTracker";
import Navbar from "../components/Navbar";
import StatusTimeline from "../components/StatusTimeline";

export default function TrackingPage() {
  return (
    <div className="min-h-screen bg-[#f6f6f6] pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 mb-10">
          <div>
            <p className="text-orange-500 font-semibold uppercase tracking-[3px]">
              Live Tracking
            </p>

            <h1 className="text-5xl font-black mt-3">
              Track Your Order 🚚
            </h1>
          </div>

          <div className="bg-green-100 text-green-700 px-6 py-4 rounded-2xl font-bold">
            ETA: --
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-2">
            <DeliveryTracker />
          </div>

          <StatusTimeline />

          <DeliveryPartnerCard />
        </div>

        <div className="mt-10">
          <DeliveryTimeline />
        </div>
      </main>
    </div>
  );
}