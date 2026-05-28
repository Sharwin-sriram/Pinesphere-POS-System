"use client";

import React from "react";
import { Clock, Utensils, ShoppingBag, Bike } from "lucide-react";
import { KDSTicket, KDSUrgency } from "../types";
import { KDSCourse } from "../types";

interface KDSTicketHeaderProps {
  ticket: KDSTicket;
  elapsedSeconds: number;
  urgency: KDSUrgency;
}

const ORDER_TYPE_ICONS: Record<string, React.ReactNode> = {
  dine_in: <Utensils size={11} strokeWidth={2} />,
  takeaway: <ShoppingBag size={11} strokeWidth={2} />,
  delivery: <Bike size={11} strokeWidth={2} />,
};

const ORDER_TYPE_LABELS: Record<string, string> = {
  dine_in: "Dine In",
  takeaway: "Takeaway",
  delivery: "Delivery",
};

const COURSE_COLORS: Record<KDSCourse, string> = {
  starter: "var(--color-blue)",
  main: "var(--color-accent-green)",
  side: "var(--color-accent)",
  dessert: "var(--color-blue-hover)",
};

const URGENCY_TIMER_COLOR: Record<KDSUrgency, string> = {
  normal: "var(--color-text-muted)",
  warning: "var(--color-warning)",
  critical: "var(--color-danger)",
};

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function KDSTicketHeader({
  ticket,
  elapsedSeconds,
  urgency,
}: KDSTicketHeaderProps) {
  const tableLabel = ticket.table_number
    ? `Table ${ticket.table_number}`
    : ticket.order_number
    ? `#${ticket.order_number}`
    : ticket.kot_number;

  const courseColor = COURSE_COLORS[ticket.course] ?? "var(--color-text-muted)";
  const timerColor = URGENCY_TIMER_COLOR[urgency];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "var(--space-3)",
        paddingBottom: "var(--space-3)",
        borderBottom: "1px solid var(--color-border)",
        marginBottom: "var(--space-3)",
      }}
    >
      {/* Left: table / order number + course badge */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", minWidth: 0 }}>
        <span
          style={{
            fontSize: "var(--text-md)",
            fontWeight: "var(--weight-semibold)",
            color: "var(--color-text-primary)",
            letterSpacing: "var(--tracking-tight)",
            lineHeight: "var(--leading-tight)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {tableLabel}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          {/* Course badge */}
          <span
            style={{
              fontSize: "var(--text-2xs)",
              fontWeight: "var(--weight-semibold)",
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-widest)",
              color: courseColor,
              background: `${courseColor}18`,
              padding: "2px var(--space-2)",
              borderRadius: "var(--radius-full)",
              border: `1px solid ${courseColor}33`,
            }}
          >
            {ticket.course}
          </span>

          {/* Order type badge */}
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              fontSize: "var(--text-2xs)",
              fontWeight: "var(--weight-medium)",
              color: "var(--color-text-muted)",
            }}
          >
            {ORDER_TYPE_ICONS[ticket.order_type]}
            {ORDER_TYPE_LABELS[ticket.order_type]}
          </span>
        </div>
      </div>

      {/* Right: elapsed timer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          flexShrink: 0,
          color: timerColor,
          transition: "color var(--duration-slow) var(--ease-base)",
        }}
      >
        <Clock size={12} strokeWidth={2} />
        <span
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: "var(--weight-semibold)",
            fontVariantNumeric: "tabular-nums",
            fontFamily: "var(--font-mono)",
          }}
        >
          {formatElapsed(elapsedSeconds)}
        </span>
      </div>
    </div>
  );
}
