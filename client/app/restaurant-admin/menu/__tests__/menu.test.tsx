// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useMenu from "../hooks/useMenu";
import { menuApi } from "../services/menuApi";
import { MenuItem } from "../types";

// Mock menuApi and react-hot-toast
vi.mock("../services/menuApi", () => ({
  menuApi: {
    getMenu: vi.fn(),
    getMenuItem: vi.fn(),
    createMenuItem: vi.fn(),
    updateMenuItem: vi.fn(),
    deleteMenuItem: vi.fn(),
    bulkDeleteMenuItems: vi.fn(),
    getCategories: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

const mockItems: MenuItem[] = [
  {
    id: "m1",
    name: "Zinger Burger",
    description: "Signature crispy chicken",
    price: 180,
    category: "Burgers",
    tags: ["Non-Veg"],
    quantity: 10,
    low_stock_threshold: 5,
    status: "Active",
    available_days: ["Mon", "Tue"],
    available_hours: { from: "11:00", to: "23:00" },
  },
  {
    id: "m2",
    name: "Fries",
    description: "Crispy fries",
    price: 100,
    category: "Sides",
    tags: ["Veg"],
    quantity: 0,
    low_stock_threshold: 5,
    status: "Out of Stock",
    available_days: ["Mon", "Tue"],
    available_hours: { from: "11:00", to: "23:00" },
  },
];

describe("Menu Management - useMenu Hooks and Integrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(menuApi.getMenu).mockResolvedValue({
      results: [...mockItems],
      page: 1,
      page_size: 10,
      total: 2,
      has_next: false,
    });
    vi.mocked(menuApi.getCategories).mockResolvedValue([
      { id: "c1", name: "Burgers" },
      { id: "c2", name: "Sides" },
    ]);
  });

  // 1. Test Fetching and Loading States
  it("should retrieve menu items and categories on load", async () => {
    const { result } = renderHook(() => useMenu("r1"));

    // Expect initial loading
    expect(result.current.loading).toBe(true);

    // Wait for effect cycles to resolve promises
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.items).toHaveLength(2);
    expect(result.current.categories).toHaveLength(2);
  });

  // 2. Test Optimistic Update and Rollback for Status Toggle
  it("should optimistically toggle item status and rollback on API failure", async () => {
    vi.mocked(menuApi.updateMenuItem).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useMenu("r1"));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.items[0].status).toBe("Active");

    let promise;
    act(() => {
      promise = result.current.toggleItemStatus("m1");
    });

    // Check optimistic update is applied immediately before server response
    expect(result.current.items[0].status).toBe("Inactive");

    // Wait for the update promise to reject
    await act(async () => {
      try {
        await promise;
      } catch (e) {
        // ignore
      }
    });

    // Check that state rolled back to original status
    expect(result.current.items[0].status).toBe("Active");
  });

  // 3. Test Optimistic Stepper and Debounce Quantity Updates
  it("should update quantity optimistically and debounces API request", async () => {
    vi.useFakeTimers();
    vi.mocked(menuApi.updateMenuItem).mockResolvedValue({ ...mockItems[0], quantity: 12 });

    const { result } = renderHook(() => useMenu("r1"));
    // Wait for load
    await act(async () => {
      vi.useRealTimers();
      await new Promise((resolve) => setTimeout(resolve, 0));
      vi.useFakeTimers();
    });

    expect(result.current.items[0].quantity).toBe(10);

    // Trigger update
    act(() => {
      result.current.updateItemQuantity("m1", 12);
    });

    // Optimistic update should be immediate
    expect(result.current.items[0].quantity).toBe(12);

    // API should not have been called yet due to 400ms debounce
    expect(menuApi.updateMenuItem).not.toHaveBeenCalled();

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(menuApi.updateMenuItem).toHaveBeenCalledWith("r1", "m1", { quantity: 12, fail: false });
    vi.useRealTimers();
  });

  // 4. Test Stepper Status Conversion Rule
  it("should atomically set status to Out of Stock if quantity reaches 0", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useMenu("r1"));
    await act(async () => {
      vi.useRealTimers();
      await new Promise((resolve) => setTimeout(resolve, 0));
      vi.useFakeTimers();
    });

    expect(result.current.items[0].status).toBe("Active");

    act(() => {
      result.current.updateItemQuantity("m1", 0);
    });

    // Quantity goes to 0, status must atomically toggle to "Out of Stock"
    expect(result.current.items[0].quantity).toBe(0);
    expect(result.current.items[0].status).toBe("Out of Stock");
    vi.useRealTimers();
  });

  it("should atomically restore status to Active if quantity rises from 0", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useMenu("r1"));
    await act(async () => {
      vi.useRealTimers();
      await new Promise((resolve) => setTimeout(resolve, 0));
      vi.useFakeTimers();
    });

    expect(result.current.items[1].status).toBe("Out of Stock");

    act(() => {
      result.current.updateItemQuantity("m2", 5);
    });

    // Quantity increases from 0, status must atomically revert to "Active"
    expect(result.current.items[1].quantity).toBe(5);
    expect(result.current.items[1].status).toBe("Active");
    vi.useRealTimers();
  });

  // 5. Test Optimistic Deletion & Rollback
  it("should optimistically remove single items and roll back on API error", async () => {
    vi.mocked(menuApi.deleteMenuItem).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useMenu("r1"));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.items).toHaveLength(2);

    let promise;
    act(() => {
      promise = result.current.deleteItem("m1");
    });

    // Item should be optimistically removed immediately
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items.find((i) => i.id === "m1")).toBeUndefined();

    // Wait for the deletion promise to reject
    await act(async () => {
      try {
        await promise;
      } catch (e) {
        // ignore
      }
    });

    // Check that state rolled back and item is restored
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].id).toBe("m1");
  });

  // 6. Test Category Add and Renaming
  it("should add a category and rename, propagating renaming to items", async () => {
    vi.mocked(menuApi.createCategory).mockResolvedValue({ id: "c3", name: "Desserts" });
    vi.mocked(menuApi.updateCategory).mockResolvedValue({ id: "c1", name: "Fabulous Burgers" });

    const { result } = renderHook(() => useMenu("r1"));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.categories).toHaveLength(2);

    // Add category
    await act(async () => {
      await result.current.addCategory("Desserts");
    });
    expect(result.current.categories).toHaveLength(3);
    expect(result.current.categories[2].name).toBe("Desserts");

    // Rename category
    expect(result.current.items[0].category).toBe("Burgers");
    await act(async () => {
      await result.current.renameCategory("c1", "Fabulous Burgers");
    });

    // Renamed category in list
    expect(result.current.categories.find((c) => c.id === "c1")?.name).toBe("Fabulous Burgers");
    // Propagated to matching menu item
    expect(result.current.items[0].category).toBe("Fabulous Burgers");
  });
});
