"use client";

import React from "react";
import { KDSStation, KDSFilterStatus } from "../types";

interface KDSFilterTabsProps {
  stations: KDSStation[];
  stationId: string;
  filterStatus: KDSFilterStatus;
  onStationChange: (id: string) => void;
  onFilterChange: (status: KDSFilterStatus) => void;
}

const STATUS_TABS: { label: string; value: KDSFilterStatus }[] = [
  { label: "Active", value: "active" },
  { label: "On Hold", value: "held" },
  { label: "Bumped", value: "bumped" },
];

export default function KDSFilterTabs({
  stations,
  stationId,
  filterStatus,
  onStationChange,
  onFilterChange,
}: KDSFilterTabsProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-4)",
        padding: "var(--space-3) var(--space-6)",
        background: "var(--color-bg-secondary)",
        borderBottom: "1px solid var(--color-border)",
        flexWrap: "wrap",
        justifyContent: "space-between",
      }}
    >
      {/* Station tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <span
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: "var(--weight-medium)",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "var(--tracking-widest)",
            marginRight: "var(--space-2)",
          }}
        >
          Station
        </span>
        {stations.length === 0 ? (
          <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
            No stations
          </span>
        ) : (
          stations.map((station) => (
            <TabButton
              key={station.id}
              label={station.name}
              active={station.id === stationId}
              onClick={() => onStationChange(station.id)}
              activeColor="var(--color-blue)"
              activeSubtle="var(--color-blue-subtle)"
            />
          ))
        )}
      </div>

      {/* Status filter tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
        {STATUS_TABS.map((tab) => (
          <TabButton
            key={tab.value}
            label={tab.label}
            active={filterStatus === tab.value}
            onClick={() => onFilterChange(tab.value)}
            activeColor="var(--color-accent-green)"
            activeSubtle="var(--color-accent-green-subtle)"
          />
        ))}
      </div>
    </div>
  );
}

interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  activeColor: string;
  activeSubtle: string;
}

function TabButton({ label, active, onClick, activeColor, activeSubtle }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "var(--space-1) var(--space-4)",
        height: 32,
        borderRadius: "var(--radius-md)",
        border: active ? `1px solid ${activeColor}44` : "1px solid transparent",
        background: active ? activeSubtle : "transparent",
        color: active ? activeColor : "var(--color-text-secondary)",
        fontSize: "var(--text-sm)",
        fontWeight: active ? "var(--weight-semibold)" : "var(--weight-medium)",
        fontFamily: "var(--font-ui)",
        cursor: "pointer",
        transition: `background var(--duration-base) var(--ease-base),
                     color var(--duration-base) var(--ease-base)`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}
