"use client";

import { useEffect, useRef, useState } from "react";
import { KDSTicket, KDSUrgency } from "../types";

const WARNING_THRESHOLD = 8 * 60;   // 8 minutes in seconds
const CRITICAL_THRESHOLD = 12 * 60; // 12 minutes in seconds

export function getUrgency(elapsedSeconds: number): KDSUrgency {
  if (elapsedSeconds >= CRITICAL_THRESHOLD) return "critical";
  if (elapsedSeconds >= WARNING_THRESHOLD) return "warning";
  return "normal";
}

/**
 * Single shared interval that recalculates elapsed seconds for every ticket
 * once per second. Returns a map of ticketId → current elapsedSeconds.
 * Per-ticket urgency is derived via getUrgency() at render time.
 */
export function useTicketTimer(tickets: KDSTicket[]): Map<string, number> {
  const [elapsedMap, setElapsedMap] = useState<Map<string, number>>(
    () => buildMap(tickets)
  );
  const ticketsRef = useRef(tickets);

  // Keep ref in sync without re-creating the interval
  useEffect(() => {
    ticketsRef.current = tickets;
    setElapsedMap(buildMap(tickets));
  }, [tickets]);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsedMap(buildMap(ticketsRef.current));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return elapsedMap;
}

function buildMap(tickets: KDSTicket[]): Map<string, number> {
  const now = Date.now();
  const map = new Map<string, number>();
  for (const t of tickets) {
    const created = new Date(t.created_at).getTime();
    map.set(t.id, Math.floor((now - created) / 1000));
  }
  return map;
}
