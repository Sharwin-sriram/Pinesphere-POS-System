"use client";

import React from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { KDSStats } from "../types";

interface KDSStatsBarProps {
  stats: KDSStats;
  wsConnected: boolean;
}

function formatMinutes(seconds: number): string {
  if (seconds === 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export default function KDSStatsBar({ stats, wsConnected }: KDSStatsBarProps) {
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
      }}
    >
      {/* Active tickets */}
      <StatPill
        icon={<Activity size={13} strokeWidth={2} />}
        label="Active"
        value={String(stats.active_count)}
        color="var(--color-blue)"
        subtleColor="var(--color-blue-subtle)"
      />

      {/* Overdue tickets */}
      <StatPill
        icon={<AlertTriangle size={13} strokeWidth={2} />}
        label="Overdue"
        value={String(stats.overdue_count)}
        color={
          stats.overdue_count > 0
            ? "var(--color-danger)"
            : "var(--color-text-muted)"
        }
        subtleColor={
          stats.overdue_count > 0
            ? "var(--color-danger-subtle)"
            : "var(--color-bg-tertiary)"
        }
      />

      {/* Bumped today */}
      <StatPill
        icon={<CheckCircle2 size={13} strokeWidth={2} />}
        label="Bumped today"
        value={String(stats.bumped_today)}
        color="var(--color-success)"
        subtleColor="var(--color-success-subtle)"
      />

      {/* Average prep time */}
      <StatPill
        icon={<Clock size={13} strokeWidth={2} />}
        label="Avg prep"
        value={formatMinutes(Math.round(stats.avg_prep_seconds))}
        color="var(--color-accent)"
        subtleColor="var(--color-accent-subtle)"
      />

      {/* WS connection indicator — pushed to right */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "var(--radius-full)",
            background: wsConnected
              ? "var(--color-success)"
              : "var(--color-danger)",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-muted)",
            fontWeight: "var(--weight-medium)",
          }}
        >
          {wsConnected ? "Live" : "Offline"}
        </span>
      </div>
    </div>
  );
}

interface StatPillProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  subtleColor: string;
}

function StatPill({ icon, label, value, color, subtleColor }: StatPillProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        padding: "var(--space-1) var(--space-3)",
        borderRadius: "var(--radius-full)",
        background: subtleColor,
        border: `1px solid ${color}22`,
      }}
    >
      <span style={{ color, display: "flex", alignItems: "center" }}>{icon}</span>
      <span
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-muted)",
          fontWeight: "var(--weight-medium)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "var(--text-sm)",
          fontWeight: "var(--weight-semibold)",
          color,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </div>
  );
}
