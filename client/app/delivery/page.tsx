"use client";

import DeliveryStatsCards from "./components/DeliveryStatsCards";
import DeliveryMap from "./components/DeliveryMap";
import ActiveOrdersTable from "./components/ActiveOrdersTable";
import EarningsCard from "./components/EarningsCard";

export default function DeliveryDashboardPage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <DeliveryStatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DeliveryMap />
        </div>

        <div>
          <EarningsCard />
        </div>
      </div>

      <div>
        <ActiveOrdersTable />
      </div>
    </div>
  );
}