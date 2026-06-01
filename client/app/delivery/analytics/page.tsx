"use client";

import DeliveryAnalyticsCharts from "../components/DeliveryAnalyticsCharts";
import DeliveryStatsCards from "../components/DeliveryStatsCards";

export default function DeliveryAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            Delivery Analytics
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Performance overview and insights
          </p>
        </div>
        <button className="btn-light px-5 py-2 flex items-center gap-2">
          Export Report
        </button>
      </div>

      {/* Stats */}
      <DeliveryStatsCards />

      {/* Charts */}
      <DeliveryAnalyticsCharts />

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card-light !p-5">
          <p className="text-sm text-[var(--color-text-secondary)] font-medium">Peak Delivery Hour</p>
          <h2 className="text-3xl font-bold mt-2 text-[var(--color-text-primary)]">8 PM</h2>
        </div>
        <div className="card-light !p-5">
          <p className="text-sm text-[var(--color-text-secondary)] font-medium">Top Rider</p>
          <h2 className="text-3xl font-bold mt-2 text-[var(--color-text-primary)]">Arjun</h2>
        </div>
        <div className="card-light !p-5">
          <p className="text-sm text-[var(--color-text-secondary)] font-medium">Success Rate</p>
          <h2 className="text-3xl font-bold mt-2 text-[var(--color-accent)]">96%</h2>
        </div>
      </div>
    </div>
  );
}