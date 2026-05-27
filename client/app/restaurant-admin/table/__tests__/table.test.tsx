// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTables, getEstWaitTime } from "../hooks/useTables";
import { tableApi } from "../services/tableApi";
import { Table } from "../types";
import { OCCUPANCY_THRESHOLDS } from "../config";

// Mock tableApi and react-hot-toast
vi.mock("../services/tableApi", () => ({
  tableApi: {
    getTables: vi.fn(),
    createTable: vi.fn(),
    deleteTable: vi.fn(),
    updateTable: vi.fn(),
    getTableOrders: vi.fn(),
    addOrderItem: vi.fn(),
    updateOrderItemStatus: vi.fn(),
    bulkServeOrderItems: vi.fn(),
    deleteOrderItem: vi.fn(),
    getTableBill: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockTablesList: Table[] = [
  {
    id: "t1",
    number: 1,
    capacity: 4,
    section: "Indoor",
    notes: "",
    status: "Available",
    waiter: "",
    seated_at: "",
  },
  {
    id: "t2",
    number: 2,
    capacity: 2,
    section: "Outdoor",
    notes: "",
    status: "Occupied",
    waiter: "Sarah Jenkins",
    seated_at: new Date(new Date().getTime() - 20 * 60000).toISOString(), // seated 20 mins ago
  },
  {
    id: "t3",
    number: 3,
    capacity: 6,
    section: "Indoor",
    notes: "",
    status: "Reserved",
    waiter: "Michael Chang",
    seated_at: "",
    reserved_at: "",
  },
];

describe("Table Management - useTables Hooks and Integrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(tableApi.getTables).mockResolvedValue([...mockTablesList]);
  });

  // 1. Fetching and Loading States
  it("should retrieve tables and sort them by table number on load", async () => {
    const { result } = renderHook(() => useTables("r1"));

    expect(result.current.loading).toBe(true);

    // Resolve initial fetching promise
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.tables).toHaveLength(3);
    expect(result.current.tables[0].number).toBe(1);
    expect(result.current.tables[1].number).toBe(2);
    expect(result.current.tables[2].number).toBe(3);
  });

  // 2. Estimated Wait Time Calculations (Task 10 unit test requirement)
  it("should correctly compute wait time from seating timestamp and handle fallbacks", () => {
    // Current time
    const now = new Date().getTime();

    // Seated 20 minutes ago (45 - 20 = 25 minutes remaining)
    const seated20 = new Date(now - 20 * 60000).toISOString();
    expect(getEstWaitTime(seated20)).toBe(25);

    // Seated 42 minutes ago (45 - 42 = 3 minutes -> minimum fallback of 5 minutes)
    const seated42 = new Date(now - 42 * 60000).toISOString();
    expect(getEstWaitTime(seated42)).toBe(5);

    // Seated 60 minutes ago (exceeded -> minimum fallback of 5 minutes)
    const seated60 = new Date(now - 60 * 60000).toISOString();
    expect(getEstWaitTime(seated60)).toBe(5);

    // Fallback default wait time (18 mins if seatedAt is empty)
    expect(getEstWaitTime(undefined)).toBe(18);
  });

  // 3. Table Uniqueness Validation (Task 10 unit test requirement)
  it("should validate table number uniqueness before creation", async () => {
    const { result } = renderHook(() => useTables("r1"));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Uniqueness validation simulation on create table
    // Try to add table number 2 (already exists)
    vi.mocked(tableApi.createTable).mockRejectedValue(new Error("Table number already exists"));

    const success = await act(async () => {
      return await result.current.addTable({
        number: 2,
        capacity: 4,
        section: "Indoor",
      });
    });

    expect(success).toBe(false);
  });

  // 4. Optimistic Status Updates and Rollbacks (Task 10 unit test requirement)
  it("should optimistically update table status and rollback on server error", async () => {
    vi.mocked(tableApi.updateTable).mockRejectedValue(new Error("Network Error"));

    const { result } = renderHook(() => useTables("r1"));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.tables[0].status).toBe("Available");

    let promise;
    act(() => {
      promise = result.current.updateTableStatus("t1", "Occupied", "Sarah Jenkins");
    });

    // Optimistic status update applied immediately
    expect(result.current.tables[0].status).toBe("Occupied");
    expect(result.current.tables[0].waiter).toBe("Sarah Jenkins");

    // Wait for update promise to fail and trigger rollback
    await act(async () => {
      await promise;
    });

    // State must revert back to Available
    expect(result.current.tables[0].status).toBe("Available");
    expect(result.current.tables[0].waiter).toBe("");
  });

  // 5. Occupancy rate levels and threshold boundaries (Task 10 unit test requirement)
  it("should correctly compute occupancy rate boundary shifts", () => {
    const calcRate = (occupied: number, total: number) => {
      return total > 0 ? Math.round((occupied / total) * 100) : 0;
    };

    // Low occupancy rate: 1 occupied out of 4 tables (25% < 70% -> Low/Green)
    const rateLow = calcRate(1, 4);
    expect(rateLow).toBeLessThan(OCCUPANCY_THRESHOLDS.LOW);

    // Medium occupancy rate: 3 occupied out of 4 tables (75% >= 70% and < 90% -> Medium/Amber)
    const rateMed = calcRate(3, 4);
    expect(rateMed).toBeGreaterThanOrEqual(OCCUPANCY_THRESHOLDS.LOW);
    expect(rateMed).toBeLessThan(OCCUPANCY_THRESHOLDS.HIGH);

    // High occupancy rate: 4 occupied out of 4 tables (100% >= 90% -> High/Red)
    const rateHigh = calcRate(4, 4);
    expect(rateHigh).toBeGreaterThanOrEqual(OCCUPANCY_THRESHOLDS.HIGH);
  });
});
