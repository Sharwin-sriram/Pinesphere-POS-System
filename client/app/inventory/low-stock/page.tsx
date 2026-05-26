"use client";

import InventoryLayout from "../components/InventoryLayout";

import EmptyState from "../components/EmptyState";

export default function LowStockPage() {
  return (
    <InventoryLayout>
      <h1 className="text-3xl font-bold mb-6">
        Low Stock Alerts
      </h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <EmptyState
          title="No Low Stock Alerts"
          subtitle="Low stock alerts from backend will appear here"
        />
      </div>
    </InventoryLayout>
  );
}