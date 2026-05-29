import React from "react";
import { Table } from "../types";
import { TableTile } from "./TableTile";

interface TableGridProps {
  tables: Table[];
  onTableClick: (table: Table) => void;
}

export default function TableGrid({ tables, onTableClick }: TableGridProps) {
  if (tables.length === 0) {
    return (
      <div className="w-full text-center py-16 border border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-bg-secondary)] shadow-sm">
        <p className="text-[var(--color-text-secondary)] font-medium">
          No tables found on this floor. Click "+ Add Table" to get started.
        </p>
      </div>
    );
  }

  // Group tables by section
  const sections = tables.reduce((acc: Record<string, Table[]>, table) => {
    const sec = table.section || "General";
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(table);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-10" role="grid" aria-label="Restaurant table floor grid">
      {Object.entries(sections).map(([sectionName, sectionTables]) => (
        <div key={sectionName} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
              {sectionName} Section
            </h3>
            <span className="text-xs bg-[var(--color-bg-tertiary)] px-2 py-0.5 rounded-md font-semibold text-[var(--color-text-secondary)]">
              {sectionTables.length} {sectionTables.length === 1 ? "table" : "tables"}
            </span>
            <div className="flex-1 h-[1px] bg-[var(--color-border)]" />
          </div>

          {/* Grid Layout conforming to exact col specifications:
              6-col on large desktop (xl), 4-col on desktop (lg), 3-col on tablet (md), 2-col on mobile (sm) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {sectionTables.map((table) => (
              <TableTile
                key={table.id}
                table={table}
                onClick={onTableClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
