"use client";

import React from "react";
import { CheckCircle2, Layers } from "lucide-react";
import { KDSFilterStatus } from "../types";

interface KDSEmptyBoardProps {
  filterStatus: KDSFilterStatus;
  stationId: string;
}

const MESSAGES: Record<KDSFilterStatus, { title: string; body: string }> = {
  active: {
    title: "All clear",
    body: "No active tickets. The kitchen is caught up.",
  },
  held: {
    title: "No held tickets",
    body: "No tickets are currently on hold.",
  },
  bumped: {
    title: "No bumped tickets",
    body: "No tickets have been bumped yet today.",
  },
};

export default function KDSEmptyBoard({ filterStatus, stationId }: KDSEmptyBoardProps) {
  const { title, body } = MESSAGES[filterStatus];
  const noStation = !stationId;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-4)",
        padding: "var(--space-12)",
        color: "var(--color-text-muted)",
      }}
    >
      {noStation ? (
        <>
          <Layers
            size={36}
            strokeWidth={1.25}
            style={{ color: "var(--color-border-strong)" }}
          />
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: "var(--text-md)",
                fontWeight: "var(--weight-semibold)",
                color: "var(--color-text-secondary)",
                margin: 0,
              }}
            >
              No station selected
            </p>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-muted)",
                marginTop: "var(--space-1)",
              }}
            >
              Select a kitchen station above to view its tickets.
            </p>
          </div>
        </>
      ) : (
        <>
          <CheckCircle2
            size={36}
            strokeWidth={1.25}
            style={{ color: "var(--color-success)" }}
          />
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: "var(--text-md)",
                fontWeight: "var(--weight-semibold)",
                color: "var(--color-text-secondary)",
                margin: 0,
              }}
            >
              {title}
            </p>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-muted)",
                marginTop: "var(--space-1)",
              }}
            >
              {body}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
