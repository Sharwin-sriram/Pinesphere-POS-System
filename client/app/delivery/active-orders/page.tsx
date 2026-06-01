"use client";

import { useState } from "react";
import ActiveOrdersTable from "../components/ActiveOrdersTable";
import RiderSimulatorModal from "../components/RiderSimulatorModal";

export default function ActiveOrdersPage() {
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="card-light !p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Active Orders</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">Manage and assign riders to orders</p>
          </div>
          <button 
            onClick={() => setIsSimulatorOpen(true)}
            className="btn-light px-5 py-2"
          >
            Open Rider App Simulator
          </button>
        </div>
        <ActiveOrdersTable key={refreshKey} />
      </div>

      <RiderSimulatorModal 
        isOpen={isSimulatorOpen} 
        onClose={() => setIsSimulatorOpen(false)} 
        onSuccess={() => setRefreshKey(prev => prev + 1)} 
      />
    </div>
  );
}
