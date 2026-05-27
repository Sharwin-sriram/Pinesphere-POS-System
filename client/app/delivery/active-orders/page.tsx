"use client";

import DeliverySidebar from "../components/DeliverySidebar";
import DeliveryTopbar from "../components/DeliveryTopbar";
import ActiveOrdersTable from "../components/ActiveOrdersTable";

export default function ActiveOrdersPage() {
  return (
    <div className="flex bg-[#f5f7fb] min-h-screen">
      <DeliverySidebar />

      <main className="flex-1 p-6">
        <DeliveryTopbar />

        <div className="mt-6 bg-white p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-bold">
              Active Orders
            </h1>

            <button className="bg-blue-600 text-white px-5 py-2 rounded-xl">
              Assign Rider
            </button>
          </div>

          <ActiveOrdersTable />
        </div>
      </main>
    </div>
  );
}