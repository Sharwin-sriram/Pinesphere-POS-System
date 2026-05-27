// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOptimisticFavorites } from "./useOptimisticFavorites";
import { toggleRestaurantFavorite } from "../services/restaurantsApi";

// Mock the API layer
vi.mock("../services/restaurantsApi", () => ({
  toggleRestaurantFavorite: vi.fn(),
}));

describe("useOptimisticFavorites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should initialize with empty favorites if localStorage is empty", () => {
    const { result } = renderHook(() => useOptimisticFavorites());
    expect(result.current.favorites).toEqual({});
  });

  it("should initialize with values from localStorage", () => {
    localStorage.setItem("pos_favorite_restaurants", JSON.stringify({ r1: true }));
    const { result } = renderHook(() => useOptimisticFavorites());
    expect(result.current.favorites).toEqual({ r1: true });
  });

  it("should optimistically toggle favorite to true and keep it on API success", async () => {
    vi.mocked(toggleRestaurantFavorite).mockResolvedValue({ success: true, id: "r1", is_favorite: true });
    
    const { result } = renderHook(() => useOptimisticFavorites());
    
    let promise;
    act(() => {
      promise = result.current.toggleFavorite("r1");
    });
    
    // Check optimistic update is applied immediately
    expect(result.current.favorites["r1"]).toBe(true);
    
    // Wait for the API promise to resolve
    await act(async () => {
      await promise;
    });
    
    // Value remains true
    expect(result.current.favorites["r1"]).toBe(true);
    expect(toggleRestaurantFavorite).toHaveBeenCalledWith("r1", true, false);
  });

  it("should roll back to previous state if API call fails", async () => {
    vi.mocked(toggleRestaurantFavorite).mockRejectedValue(new Error("API failure"));
    
    const { result } = renderHook(() => useOptimisticFavorites());
    
    let promise;
    act(() => {
      promise = result.current.toggleFavorite("r1");
    });
    
    // Optimistic update should be true
    expect(result.current.favorites["r1"]).toBe(true);
    
    // Wait for resolution
    await act(async () => {
      try {
        await promise;
      } catch (e) {
        // ignore error
      }
    });
    
    // Rolled back to undefined/false
    expect(result.current.favorites["r1"]).toBe(false);
  });
});
