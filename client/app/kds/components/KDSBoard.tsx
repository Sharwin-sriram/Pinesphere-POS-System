"use client";

import React from "react";
import { KDSTicket as KDSTicketType } from "../types";
import { useTicketTimer, getUrgency } from "../hooks/useTicketTimer";
import KDSTicket from "./KDSTicket";

interface KDSBoardProps {
  tickets: KDSTicketType[];
  onBump: (id: string) => void;
  onRecall: (id: string) => void;
  onHold: (id: string) => void;
}

export default function KDSBoard({
  tickets,
  onBump,
  onRecall,
  onHold,
}: KDSBoardProps) {
  // Single shared interval — one call for the whole board
  const elapsedMap = useTicketTimer(tickets);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "var(--space-4)",
        padding: "var(--space-6)",
        alignItems: "start",
        overflowY: "auto",
        flex: 1,
      }}
    >
      {tickets.map((ticket) => {
        const elapsed = elapsedMap.get(ticket.id) ?? ticket.elapsed_seconds;
        const urgency = getUrgency(elapsed);
        return (
          <KDSTicket
            key={ticket.id}
            ticket={ticket}
            elapsedSeconds={elapsed}
            urgency={urgency}
            onBump={onBump}
            onRecall={onRecall}
            onHold={onHold}
          />
        );
      })}
    </div>
  );
}
