import React from "react";
import { Table } from "../types";
import { OCCUPANCY_THRESHOLDS, WAIT_TIME_MULTIPLIER } from "../config";
import { CheckCircle, Clock, Grid, ShieldAlert, Users } from "lucide-react";

interface TableStatsProps {
  tables: Table[];
}

export default function TableStats({ tables }: TableStatsProps) {
  const total = tables.length;
  const occupied = tables.filter((t) => t.status === "Occupied").length;
  const available = tables.filter((t) => t.status === "Available").length;
  const reserved = tables.filter((t) => t.status === "Reserved").length;

  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
  const availableRate = total > 0 ? Math.round((available / total) * 100) : 0;

  // Average wait time based on occupancy depth
  const avgWaitTime = occupied > 0 ? Math.round(occupied * WAIT_TIME_MULTIPLIER) : 0;

  // Progress bar color based on occupancy rate thresholds
  let progressBarColor = "bg-[var(--color-success)]";
  if (occupancyRate >= OCCUPANCY_THRESHOLDS.HIGH) {
    progressBarColor = "bg-[var(--color-danger)]";
  } else if (occupancyRate >= OCCUPANCY_THRESHOLDS.LOW) {
    progressBarColor = "bg-[var(--color-warning)]";
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 overflow-x-auto pb-2 flex-nowrap scrollbar-thin">
      {/* Total Tables */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 flex items-center justify-between shadow-sm min-w-[200px]">
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Total Tables
          </p>
          <h3 className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">
            {total}
          </h3>
        </div>
        <div className="p-3 bg-[var(--color-bg-tertiary)] rounded-xl">
          <Grid className="h-6 w-6 text-[var(--color-text-secondary)]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Occupied */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col justify-between shadow-sm min-w-[220px]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Occupied
            </p>
            <h3 className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">
              {occupied}{" "}
              <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
                ({occupancyRate}%)
              </span>
            </h3>
          </div>
          <div className="p-3 bg-[var(--color-warning-subtle)] rounded-xl">
            <Users className="h-6 w-6 text-[var(--color-warning)]" strokeWidth={1.5} />
          </div>
        </div>
        {/* Occupied Progress Bar */}
        <div className="w-full mt-4">
          <div className="w-full bg-[var(--color-bg-tertiary)] h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${progressBarColor} transition-all duration-500`}
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Available */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col justify-between shadow-sm min-w-[220px]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Available
            </p>
            <h3 className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">
              {available}{" "}
              <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
                ({availableRate}%)
              </span>
            </h3>
          </div>
          <div className="p-3 bg-[var(--color-success-subtle)] rounded-xl">
            <CheckCircle className="h-6 w-6 text-[var(--color-success)]" strokeWidth={1.5} />
          </div>
        </div>
        {/* Available Progress Bar */}
        <div className="w-full mt-4">
          <div className="w-full bg-[var(--color-bg-tertiary)] h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-success)] transition-all duration-500"
              style={{ width: `${availableRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Reserved */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 flex items-center justify-between shadow-sm min-w-[200px]">
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Reserved
          </p>
          <h3 className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">
            {reserved}
          </h3>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
          <ShieldAlert className="h-6 w-6 text-blue-500" strokeWidth={1.5} />
        </div>
      </div>

      {/* Average Wait Time */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 flex items-center justify-between shadow-sm min-w-[200px]">
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Est. Wait Time
          </p>
          <h3 className="text-3xl font-bold text-[var(--color-text-primary)] mt-1">
            {avgWaitTime}{" "}
            <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
              mins
            </span>
          </h3>
        </div>
        <div className="p-3 bg-[var(--color-bg-tertiary)] rounded-xl">
          <Clock className="h-6 w-6 text-[var(--color-text-secondary)]" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
