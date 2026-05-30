"use client";

import React from "react";
import { ChevronLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import useKDS from "./hooks/useKDS";
import KDSStatsBar from "./components/KDSStatsBar";
import KDSFilterTabs from "./components/KDSFilterTabs";
import KDSBoard from "./components/KDSBoard";
import KDSEmptyBoard from "./components/KDSEmptyBoard";

export default function KDSPage() {
  return <KDSInner userId="" />;
}

// ─── Inner component — reads data directly from the KDS store ────────────────

function KDSInner({ userId }: { userId: string }) {
  const {
    stations,
    stationId,
    setStationId,
    tickets,
    stats,
    filterStatus,
    setFilterStatus,
    loading,
    wsConnected,
    bumpTicket,
    recallTicket,
    holdTicket,
    fetchTickets,
  } = useKDS(userId);

  const isEmpty = tickets.length === 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 var(--space-6)",
          height: 52,
          background: "var(--color-bg-secondary)",
          borderBottom: "1px solid var(--color-border)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <Link
            href="/restaurant-admin"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-1)",
              color: "var(--color-text-muted)",
              fontSize: "var(--text-sm)",
              textDecoration: "none",
            }}
          >
            <ChevronLeft size={14} strokeWidth={2} />
            Admin
          </Link>

          <span style={{ color: "var(--color-border)", fontSize: "var(--text-sm)" }}>
            /
          </span>

          <h1
            style={{
              fontSize: "var(--text-base)",
              fontWeight: "var(--weight-semibold)",
              color: "var(--color-text-primary)",
              margin: 0,
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            Kitchen Display
          </h1>
        </div>

        {/* Refresh button */}
        <button
          id="kds-refresh-btn"
          onClick={() => fetchTickets()}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-1)",
            height: 32,
            padding: "0 var(--space-3)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            background: "transparent",
            color: "var(--color-text-secondary)",
            fontSize: "var(--text-sm)",
            fontFamily: "var(--font-ui)",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
            transition: "opacity var(--duration-base) var(--ease-base)",
          }}
          aria-label="Refresh tickets"
        >
          <RefreshCw
            size={12}
            strokeWidth={2}
            style={{
              animation: loading ? "spin 1s linear infinite" : "none",
            }}
          />
          Refresh
        </button>
      </header>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <KDSStatsBar stats={stats} wsConnected={wsConnected} />

      {/* ── Filter tabs ──────────────────────────────────────────────────── */}
      <KDSFilterTabs
        stations={stations}
        stationId={stationId}
        filterStatus={filterStatus}
        onStationChange={setStationId}
        onFilterChange={setFilterStatus}
      />

      {/* ── Board ────────────────────────────────────────────────────────── */}
      {isEmpty ? (
        <KDSEmptyBoard filterStatus={filterStatus} stationId={stationId} />
      ) : (
        <KDSBoard
          tickets={tickets}
          onBump={bumpTicket}
          onRecall={recallTicket}
          onHold={holdTicket}
        />
      )}

      {/* ── Spin keyframes (inline so no extra CSS file needed) ─────────── */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
