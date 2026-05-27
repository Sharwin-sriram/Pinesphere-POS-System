"use client";

import DeliverySidebar from "./components/DeliverySidebar";
import DeliveryTopbar from "./components/DeliveryTopbar";
import DeliveryStatsCards from "./components/DeliveryStatsCards";
import DeliveryMap from "./components/DeliveryMap";
import ActiveOrdersTable from "./components/ActiveOrdersTable";
import EarningsCard from "./components/EarningsCard";

export default function DeliveryDashboardPage() {
  return (
    <div className="flex bg-[#f5f7fb] min-h-screen">
      <DeliverySidebar />

      <main className="flex-1 p-6">
        <DeliveryTopbar />

        <div className="mt-6">
          <DeliveryStatsCards />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <DeliveryMap />
          </div>

          <div>
            <EarningsCard />
          </div>
        </div>

        <div className="mt-6">
          <ActiveOrdersTable />
        </div>
      </main>
    </div>
  );
}