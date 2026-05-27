"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, Calendar, RefreshCw } from "lucide-react";
import { useTables } from "./hooks/useTables";
import TableStats from "./components/TableStats";
import TableGrid from "./components/TableGrid";
import TableDrawer from "./components/TableDrawer";
import AddTableModal from "./components/AddTableModal";
import RemoveTableModal from "./components/RemoveTableModal";
import Banner from "./components/Banner";
import Button from "../../../components/ui/Button";
import Skeleton from "../../../components/ui/Skeleton";

export default function TableManagementPage() {
  const restaurantId = "r1";
  const restaurantName = "KFC - Kentucky Fried Chicken";

  const {
    tables,
    loading,
    wsConnected,
    lastUpdated,
    error,
    addTable,
    removeTable,
    updateTableStatus,
    reassignWaiter,
  } = useTables(restaurantId);

  // Modal open states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);

  // Drawer selected table
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Client-side only state for formatted time to prevent hydration mismatch
  const [formattedTime, setFormattedTime] = useState<string>("");

  useEffect(() => {
    setFormattedTime(lastUpdated.toLocaleTimeString());
  }, [lastUpdated]);

  const selectedTable = useMemo(() => {
    return tables.find((t) => t.id === selectedTableId) || null;
  }, [tables, selectedTableId]);

  const existingSections = useMemo(() => {
    return Array.from(new Set(tables.map((t) => t.section))).filter(Boolean);
  }, [tables]);

  const handleTableClick = (table: any) => {
    setSelectedTableId(table.id);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col">
      {/* Real-time Connection Banner Warning */}
      <Banner wsConnected={wsConnected} />

      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[length:var(--text-xs)] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">
          <Link href="/restaurant-admin" className="hover:text-[var(--color-accent-green)] transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span>{restaurantName}</span>
          <span>/</span>
          <span className="text-[var(--color-text-primary)]">Table Management</span>
        </div>

        {/* Page Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
              Table Management
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] font-medium mt-1">
              Manage your floor, track occupancy, and monitor live orders in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsRemoveOpen(true)}
              className="flex items-center gap-2 border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
            >
              <Trash2 className="h-4 w-4" />
              <span>Remove Table</span>
            </Button>
            <Button
              variant="success"
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 bg-[var(--color-accent-green)] hover:bg-[var(--color-accent-green-hover)] text-white"
            >
              <Plus className="h-4 w-4" />
              <span>Add Table</span>
            </Button>
          </div>
        </div>

        {loading ? (
          /* Loading State Skeletons */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
            <div className="h-96 rounded-2xl">
              <Skeleton className="h-full w-full rounded-2xl" />
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-20 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl">
            <p className="text-[var(--color-danger)] font-bold text-lg">Error loading dining floor plan</p>
            <p className="text-[var(--color-text-secondary)] text-sm mt-1">{error}</p>
          </div>
        ) : (
          /* Dining floor area */
          <div className="flex flex-col gap-6">
            {/* Metric Statistics row */}
            <TableStats tables={tables} />

            {/* Responsive Table Floor grid area */}
            <div className="flex-1">
              <TableGrid tables={tables} onTableClick={handleTableClick} />
            </div>
          </div>
        )}

        {/* Live connections footer indicator */}
        <div className="flex items-center justify-between text-[length:var(--text-xs)] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider pt-8 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>Operational Area: Main Floor Plan</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className={`h-3.5 w-3.5 ${wsConnected ? "text-[var(--color-success)]" : "text-[var(--color-warning)]"}`} />
            <span>
              Real-time feed:{" "}
              {wsConnected ? (
                <span className="text-[var(--color-success)] font-bold">Connected</span>
              ) : (
                <span className="text-[var(--color-warning)] font-bold">Polling Feed</span>
              )}
            </span>
            <span>•</span>
            <span>Last sync: {formattedTime || "—"}</span>
          </div>
        </div>
      </div>

      {/* Slide-out Orders side sheet drawer */}
      {selectedTable && (
        <TableDrawer
          table={selectedTable}
          onClose={() => setSelectedTableId(null)}
          restaurantId={restaurantId}
          onStatusChange={updateTableStatus}
          onWaiterReassign={reassignWaiter}
        />
      )}

      {/* Add Table Dialog */}
      <AddTableModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={addTable}
        existingSections={existingSections}
        restaurantId={restaurantId}
      />

      {/* Remove Table Dialog */}
      <RemoveTableModal
        isOpen={isRemoveOpen}
        onClose={() => setIsRemoveOpen(false)}
        onSubmit={removeTable}
        tables={tables}
      />
    </div>
  );
}
