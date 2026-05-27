"use client";

import DeliverySidebar from "../components/DeliverySidebar";
import DeliveryTopbar from "../components/DeliveryTopbar";
import DeliveryAnalyticsCharts from "../components/DeliveryAnalyticsCharts";
import DeliveryStatsCards from "../components/DeliveryStatsCards";

export default function DeliveryAnalyticsPage() {
  return (
    <div className="flex bg-[#f5f7fb] min-h-screen">
      <DeliverySidebar />

      <main className="flex-1 p-6">
        <DeliveryTopbar />

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Delivery Analytics
              </h1>

              <p className="text-gray-500 mt-1">
                Performance overview and insights
              </p>
            </div>

            <button className="bg-blue-600 text-white px-5 py-3 rounded-xl">
              Export Report
            </button>
          </div>

          <div className="mt-6">
            <DeliveryStatsCards />
          </div>

          <div className="mt-6">
            <DeliveryAnalyticsCharts />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-gray-500">
                Peak Delivery Hour
              </p>

              <h2 className="text-3xl font-bold mt-2">
                8 PM
              </h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-gray-500">
                Top Rider
              </p>

              <h2 className="text-3xl font-bold mt-2">
                Arjun
              </h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-gray-500">
                Success Rate
              </p>

              <h2 className="text-3xl font-bold mt-2">
                96%
              </h2>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}