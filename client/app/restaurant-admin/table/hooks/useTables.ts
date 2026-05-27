import { useState, useEffect, useCallback, useRef } from "react";
import { Table, TableStatus } from "../types";
import { tableApi } from "../services/tableApi";
import toast from "react-hot-toast";

// Helper to compute remaining meal time from seating timestamp (45 mins total meal duration)
export const getEstWaitTime = (seatedAtStr?: string): number => {
  if (!seatedAtStr) return 18;
  try {
    const seatedTime = new Date(seatedAtStr).getTime();
    if (isNaN(seatedTime)) return 18;
    const now = new Date().getTime();
    const elapsedMinutes = Math.floor((now - seatedTime) / 60000);
    const remaining = 45 - elapsedMinutes;
    return remaining > 5 ? remaining : 5; // Minimum of 5 mins fallback
  } catch {
    return 18;
  }
};

export const useTables = (restaurantId: string = "r1") => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    try {
      const data = await tableApi.getTables(restaurantId);
      // Sort tables logically by table number
      setTables(data.sort((a, b) => a.number - b.number));
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch tables");
      toast.error("Could not fetch tables from server.");
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  // Connect WebSocket if client-side
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let pollInterval: any = null;
    let reconnectTimeout: any = null;

    const connectWS = () => {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "http://127.0.0.1:8000";

      let wsUrl = "";
      try {
        const url = new URL(apiBaseUrl);
        url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
        url.pathname = `/ws/restaurant/${restaurantId}/tables/`;
        url.search = "";
        wsUrl = url.toString();
      } catch {
        wsUrl = `ws://127.0.0.1:8000/ws/restaurant/${restaurantId}/tables/`;
      }

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setWsConnected(true);
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === "table_status_update") {
              setTables((prev) => {
                const updatedTable = message.table;
                const index = prev.findIndex((t) => t.id === message.table_id);
                let newList = [...prev];
                if (index !== -1) {
                  newList[index] = { ...newList[index], ...updatedTable };
                } else {
                  newList.push(updatedTable);
                }
                return newList.sort((a, b) => a.number - b.number);
              });
              setLastUpdated(new Date());
            } else if (message.type === "table_deleted") {
              setTables((prev) => prev.filter((t) => t.id !== message.table_id));
              setLastUpdated(new Date());
            }
          } catch (err) {
            console.error("Failed to parse websocket event", err);
          }
        };

        ws.onerror = () => {
          setWsConnected(false);
        };

        ws.onclose = () => {
          setWsConnected(false);
          // Fallback to polling every 10 seconds if not already polling
          if (!pollInterval) {
            pollInterval = setInterval(fetchTables, 10000);
          }
          // Attempt reconnection after 5 seconds
          reconnectTimeout = setTimeout(() => {
            connectWS();
          }, 5000);
        };
      } catch (err) {
        console.error("WebSocket initialization error", err);
        setWsConnected(false);
        if (!pollInterval) {
          pollInterval = setInterval(fetchTables, 10000);
        }
      }
    };

    connectWS();

    return () => {
      if (ws) {
        // Prevent reconnect loop on unmount
        ws.onclose = null;
        ws.close();
      }
      if (pollInterval) clearInterval(pollInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [restaurantId, fetchTables]);

  const addTable = async (payload: { number: number; capacity: number; section: string; notes?: string }) => {
    try {
      const newTable = await tableApi.createTable(restaurantId, payload);
      setTables((prev) => [...prev, newTable].sort((a, b) => a.number - b.number));
      setLastUpdated(new Date());
      toast.success(`Table ${payload.number} added successfully.`);
      return true;
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to add table");
      return false;
    }
  };

  const removeTable = async (tableId: string, tableNumber: number) => {
    try {
      const success = await tableApi.deleteTable(restaurantId, tableId);
      if (success) {
        setTables((prev) => prev.filter((t) => t.id !== tableId));
        setLastUpdated(new Date());
        toast.success(`Table ${tableNumber} removed.`);
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to remove table");
      return false;
    }
  };

  const updateTableStatus = async (
    tableId: string,
    newStatus: TableStatus,
    waiterName?: string,
    simulateFail: boolean = false
  ) => {
    const originalTables = [...tables];
    // Optimistic Local Update
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            status: newStatus,
            waiter: newStatus === "Available" ? "" : waiterName !== undefined ? waiterName : t.waiter,
            seated_at: newStatus === "Occupied" ? new Date().toISOString() : t.seated_at,
          };
        }
        return t;
      })
    );
    setLastUpdated(new Date());

    try {
      await tableApi.updateTable(restaurantId, tableId, {
        status: newStatus,
        waiter: waiterName,
        fail: simulateFail,
      });
      return true;
    } catch (err: any) {
      // Rollback on failure
      setTables(originalTables);
      toast.error("Connection failed. Status change reverted.");
      return false;
    }
  };

  const reassignWaiter = async (tableId: string, waiterName: string) => {
    const originalTables = [...tables];
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, waiter: waiterName } : t))
    );
    setLastUpdated(new Date());

    try {
      await tableApi.updateTable(restaurantId, tableId, { waiter: waiterName });
      toast.success(`Waiter reassigned to ${waiterName}.`);
      return true;
    } catch (err: any) {
      setTables(originalTables);
      toast.error("Failed to reassign waiter.");
      return false;
    }
  };

  return {
    tables,
    loading,
    wsConnected,
    lastUpdated,
    error,
    addTable,
    removeTable,
    updateTableStatus,
    reassignWaiter,
    refetch: fetchTables,
  };
};
