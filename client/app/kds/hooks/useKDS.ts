"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { kdsApi } from "../services/kdsApi";
import { KDSTicket, KDSStats, KDSStation, KDSFilterStatus } from "../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const WS_MAX_RETRIES = 5;
const WS_RETRY_BASE_MS = 1000;

const STATION_STORAGE_KEY = (userId: string) => `kds_station_${userId}`;

export function useKDS(userId: string) {
  const [stations, setStations] = useState<KDSStation[]>([]);
  const [stationId, setStationIdState] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(STATION_STORAGE_KEY(userId)) ?? "";
  });

  const [tickets, setTickets] = useState<KDSTicket[]>([]);
  const [stats, setStats] = useState<KDSStats>({
    active_count: 0,
    overdue_count: 0,
    bumped_today: 0,
    avg_prep_seconds: 0,
  });
  const [filterStatus, setFilterStatus] = useState<KDSFilterStatus>("active");
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // ─── Station selection ────────────────────────────────────────────────────

  const setStationId = useCallback(
    (id: string) => {
      setStationIdState(id);
      if (typeof window !== "undefined") {
        localStorage.setItem(STATION_STORAGE_KEY(userId), id);
      }
    },
    [userId]
  );

  // ─── Data fetching ────────────────────────────────────────────────────────

  const fetchTickets = useCallback(async () => {
    if (!stationId) return;
    setLoading(true);
    try {
      const data = await kdsApi.getTickets(stationId, filterStatus);
      if (isMountedRef.current) setTickets(data.results);
    } catch {
      // Silent fail — WS will keep data fresh; avoid spamming toasts
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [stationId, filterStatus]);

  const fetchStats = useCallback(async () => {
    if (!stationId) return;
    try {
      const data = await kdsApi.getStats(stationId);
      if (isMountedRef.current) setStats(data);
    } catch {
      // Non-critical — stats bar degrades gracefully
    }
  }, [stationId]);

  const fetchStations = useCallback(async () => {
    try {
      const data = await kdsApi.getStations("");
      if (!isMountedRef.current) return;
      setStations(data);
      // Auto-select first station if none persisted
      if (!stationId && data.length > 0) {
        setStationId(data[0].id);
      }
    } catch {
      // No stations yet
    }
  }, [stationId, setStationId]);

  // ─── WebSocket connection ────────────────────────────────────────────────

  const connectWS = useCallback(() => {
    if (!stationId) return;
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("pos_token")
        : null;
    const host = API_BASE_URL.replace(/^https?/, "ws").replace(/^http/, "ws");
    const url = `${host}/ws/kitchen/${stationId}/${token ? `?token=${token}` : ""}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isMountedRef.current) return;
      retryCountRef.current = 0;
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      if (!isMountedRef.current) return;
      try {
        const msg = JSON.parse(event.data as string);

        // Full sync on initial connect
        if (msg.type === "kitchen_sync") {
          fetchTickets();
          fetchStats();
          return;
        }

        // Targeted ticket mutation pushed by KDSTicketViewSet._broadcast()
        if (msg.type === "ticket_update") {
          const { event: evtType, ticket } = msg as {
            event: string;
            ticket: KDSTicket;
          };

          setTickets((prev) => {
            if (evtType === "bumped") {
              // Remove from active board
              return prev.filter((t) => t.id !== ticket.id);
            }
            if (evtType === "recalled") {
              // Add back to board if not already present
              const exists = prev.some((t) => t.id === ticket.id);
              return exists
                ? prev.map((t) => (t.id === ticket.id ? ticket : t))
                : [ticket, ...prev];
            }
            if (evtType === "held" || evtType === "unheld") {
              return prev.map((t) => (t.id === ticket.id ? ticket : t));
            }
            // New ticket created
            if (evtType === "created") {
              const exists = prev.some((t) => t.id === ticket.id);
              return exists ? prev : [...prev, ticket];
            }
            return prev;
          });

          // Refresh stats counters after any mutation
          fetchStats();
        }
      } catch {
        // Malformed message — ignore
      }
    };

    ws.onclose = () => {
      if (!isMountedRef.current) return;
      setWsConnected(false);
      scheduleReconnect();
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [stationId, fetchTickets, fetchStats]);

  const scheduleReconnect = useCallback(() => {
    if (retryCountRef.current >= WS_MAX_RETRIES) {
      toast.error("Kitchen connection lost. Refresh the page to reconnect.", {
        id: "ws-disconnected",
        duration: Infinity,
      });
      return;
    }
    const delay =
      WS_RETRY_BASE_MS * Math.pow(2, retryCountRef.current);
    retryCountRef.current += 1;

    if (retryCountRef.current === 1) {
      toast.loading("Reconnecting to kitchen…", { id: "ws-reconnect" });
    }

    retryTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) connectWS();
    }, delay);
  }, [connectWS]);

  // ─── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    isMountedRef.current = true;
    fetchStations();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchStations]);

  useEffect(() => {
    if (!stationId) return;
    fetchTickets();
    fetchStats();
  }, [stationId, filterStatus, fetchTickets, fetchStats]);

  // Open WS when stationId changes; close previous connection cleanly
  useEffect(() => {
    if (!stationId) return;
    if (wsRef.current) {
      wsRef.current.onclose = null; // Don't trigger reconnect on intentional close
      wsRef.current.close();
    }
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    retryCountRef.current = 0;
    connectWS();
    return () => {
      isMountedRef.current = false;
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [stationId, connectWS]);

  // Dismiss reconnect toast on successful connection
  useEffect(() => {
    if (wsConnected) {
      toast.dismiss("ws-reconnect");
      toast.dismiss("ws-disconnected");
    }
  }, [wsConnected]);

  // ─── Optimistic mutations ─────────────────────────────────────────────────

  const bumpTicket = useCallback(
    async (ticketId: string) => {
      const prev = tickets.find((t) => t.id === ticketId);
      if (!prev) return;

      // Optimistic: remove from board immediately
      setTickets((ts) => ts.filter((t) => t.id !== ticketId));
      setStats((s) => ({ ...s, active_count: Math.max(0, s.active_count - 1) }));

      try {
        await kdsApi.bumpTicket(ticketId);
        toast.success(`Ticket ${prev.kot_number} bumped`);
        fetchStats();
      } catch (err: any) {
        // Rollback
        setTickets((ts) => [...ts, prev]);
        setStats((s) => ({ ...s, active_count: s.active_count + 1 }));
        const msg =
          err?.response?.status === 409
            ? "Ticket already bumped by another terminal"
            : err?.response?.data?.error || "Failed to bump ticket";
        toast.error(msg);
      }
    },
    [tickets, fetchStats]
  );

  const recallTicket = useCallback(
    async (ticketId: string) => {
      const toastId = toast.loading("Recalling ticket…");
      try {
        const updated = await kdsApi.recallTicket(ticketId);
        setTickets((ts) => {
          const exists = ts.some((t) => t.id === updated.id);
          return exists
            ? ts.map((t) => (t.id === updated.id ? updated : t))
            : [updated, ...ts];
        });
        fetchStats();
        toast.success(`Ticket ${updated.kot_number} recalled`, { id: toastId });
      } catch (err: any) {
        toast.error(err?.response?.data?.error || "Failed to recall ticket", {
          id: toastId,
        });
      }
    },
    [fetchStats]
  );

  const holdTicket = useCallback(
    async (ticketId: string) => {
      const prev = tickets.find((t) => t.id === ticketId);
      if (!prev) return;

      // Optimistic toggle
      const optimistic = { ...prev, hold: !prev.hold };
      setTickets((ts) =>
        ts.map((t) => (t.id === ticketId ? optimistic : t))
      );

      try {
        const updated = await kdsApi.holdTicket(ticketId);
        setTickets((ts) =>
          ts.map((t) => (t.id === updated.id ? updated : t))
        );
        toast.success(
          updated.hold
            ? `Ticket ${updated.kot_number} placed on hold`
            : `Ticket ${updated.kot_number} hold removed`
        );
      } catch (err: any) {
        // Rollback
        setTickets((ts) => ts.map((t) => (t.id === ticketId ? prev : t)));
        toast.error(err?.response?.data?.error || "Failed to update hold");
      }
    },
    [tickets]
  );

  return {
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
  };
}

export default useKDS;
