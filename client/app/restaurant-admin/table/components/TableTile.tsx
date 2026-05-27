import React, { useState } from "react";
import { Table } from "../types";
import { getEstWaitTime } from "../hooks/useTables";
import { Users } from "lucide-react";

interface TableTileProps {
  table: Table;
  onClick: (table: Table) => void;
}

const TableTileComponent = ({ table, onClick }: TableTileProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Status mapping details
  const statusConfig = {
    Available: {
      badgeClass: "bg-[var(--color-success-subtle)] text-[var(--color-success)]",
      cardClass: "bg-[var(--color-success)]/4 hover:bg-[var(--color-success)]/8 border-[var(--color-success)]/20",
      tooltip: "Ready now",
    },
    Occupied: {
      badgeClass: "bg-[var(--color-warning-subtle)] text-[var(--color-warning)]",
      cardClass: "bg-[var(--color-warning)]/4 hover:bg-[var(--color-warning)]/8 border-[var(--color-warning)]/20",
      getTooltip: () => `Est. wait: ~${getEstWaitTime(table.seated_at)} min`,
    },
    Reserved: {
      badgeClass: "bg-[var(--color-blue-subtle)] text-[var(--color-blue)]",
      cardClass: "bg-[var(--color-blue)]/4 hover:bg-[var(--color-blue)]/8 border-[var(--color-blue)]/20",
      getTooltip: () => {
        const time = table.reserved_at
          ? new Date(table.reserved_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "7:30 PM";
        const estAvail = table.reserved_at
          ? new Date(new Date(table.reserved_at).getTime() + 45 * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "8:15 PM";
        return `Reserved at ${time} — Est. available: ~${estAvail}`;
      },
    },
    Cleaning: {
      badgeClass: "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]",
      cardClass: "bg-slate-500/5 hover:bg-slate-500/10 border-slate-500/15",
      tooltip: "Est. ready in ~5 min",
    },
  };

  const config = statusConfig[table.status];
  const tooltipText = "getTooltip" in config ? config.getTooltip() : config.tooltip;

  return (
    <div
      role="gridcell"
      aria-label={`Table ${table.number}, ${table.status}, Capacity ${table.capacity} seats`}
      onClick={() => onClick(table)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      className={`relative cursor-pointer aspect-square rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 ${config.cardClass} shadow-sm group hover:scale-[1.02]`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(table);
        }
      }}
    >
      {/* Table Top: Number & Capacity */}
      <div className="flex items-start justify-between">
        <h4 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Table {table.number}
        </h4>
        <div className="flex items-center gap-1 text-[var(--color-text-secondary)] text-xs font-medium">
          <Users className="h-3.5 w-3.5" />
          <span>Seats {table.capacity}</span>
        </div>
      </div>

      {/* Table Middle / Bottom: Status badge and Waiter */}
      <div className="mt-auto flex flex-col gap-2">
        <span
          className={`self-start text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${config.badgeClass}`}
          aria-label={`Status: ${table.status}`}
        >
          {table.status}
        </span>

        {/* Waiter Assignee detail */}
        {(table.status === "Occupied" || table.status === "Reserved") && table.waiter && (
          <p className="text-xs text-[var(--color-text-secondary)] font-medium truncate mt-1">
            Waiter: <span className="text-[var(--color-text-primary)] font-semibold">{table.waiter}</span>
          </p>
        )}
      </div>

      {/* Estimative Tooltip */}
      {showTooltip && (
        <div
          role="tooltip"
          className="absolute z-50 bg-[var(--color-text-primary)] text-[var(--color-text-inverse)] text-xs font-semibold px-3 py-2 rounded-lg shadow-md -top-12 left-1/2 -translate-x-1/2 w-max max-w-[240px] text-center animate-fade-in pointer-events-none"
        >
          {tooltipText}
          {/* Tooltip caret arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--color-text-primary)]" />
        </div>
      )}
    </div>
  );
};

export const TableTile = React.memo(TableTileComponent, (prevProps, nextProps) => {
  return (
    prevProps.table.id === nextProps.table.id &&
    prevProps.table.status === nextProps.table.status &&
    prevProps.table.waiter === nextProps.table.waiter &&
    prevProps.table.capacity === nextProps.table.capacity &&
    prevProps.table.section === nextProps.table.section &&
    prevProps.table.notes === nextProps.table.notes
  );
});
