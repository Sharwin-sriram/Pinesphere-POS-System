"use client";

import React from "react";
import { type KDSTicket, KDSUrgency } from "../types";
import KDSTicketHeader from "./KDSTicketHeader";
import KDSTicketItems from "./KDSTicketItems";
import KDSTicketFooter from "./KDSTicketFooter";

interface KDSTicketProps {
  ticket: KDSTicket;
  elapsedSeconds: number;
  urgency: KDSUrgency;
  onBump: (id: string) => void;
  onRecall: (id: string) => void;
  onHold: (id: string) => void;
}

const URGENCY_BORDER: Record<KDSUrgency, string> = {
  normal: "var(--color-border)",
  warning: "var(--color-warning)",
  critical: "var(--color-danger)",
};

const URGENCY_BG: Record<KDSUrgency, string> = {
  normal: "var(--color-bg-secondary)",
  warning: "rgba(245,158,11,0.04)",
  critical: "rgba(239,68,68,0.04)",
};

export default function KDSTicket({
  ticket,
  elapsedSeconds,
  urgency,
  onBump,
  onRecall,
  onHold,
}: KDSTicketProps) {
  const borderColor = ticket.hold
    ? "var(--color-accent)"
    : URGENCY_BORDER[urgency];

  const bgColor = ticket.hold
    ? "rgba(245,158,11,0.04)"
    : URGENCY_BG[urgency];

  return (
    <article
      style={{
        background: bgColor,
        border: `1.5px solid ${borderColor}`,
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-1)",
        opacity: ticket.hold ? 0.7 : 1,
        transition: `border-color var(--duration-slow) var(--ease-base),
                     background var(--duration-slow) var(--ease-base),
                     opacity var(--duration-base) var(--ease-base)`,
        minHeight: 220,
      }}
      aria-label={`Ticket ${ticket.kot_number}`}
    >
      <KDSTicketHeader
        ticket={ticket}
        elapsedSeconds={elapsedSeconds}
        urgency={urgency}
      />

      <KDSTicketItems ticket={ticket} />

      <KDSTicketFooter
        ticket={ticket}
        onBump={() => onBump(ticket.id)}
        onRecall={() => onRecall(ticket.id)}
        onHold={() => onHold(ticket.id)}
      />
    </article>
  );
}
