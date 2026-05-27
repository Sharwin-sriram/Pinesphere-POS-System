"use client";

import { useState, useEffect, useCallback } from "react";
import { toggleRestaurantFavorite } from "../services/restaurantsApi";
import toast from "react-hot-toast";

const FAVORITES_KEY = "pos_favorite_restaurants";

export function useOptimisticFavorites() {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      // ignore parsing errors
    }
    setHydrated(true);
  }, []);

  // Save to localStorage when updated
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
      // ignore quota limits
    }
  }, [favorites, hydrated]);

  const toggleFavorite = useCallback(async (id: string, shouldFailSimulated: boolean = false) => {
    const wasFavorite = !!favorites[id];
    const nextFavorite = !wasFavorite;

    // Optimistic update
    setFavorites((prev) => ({
      ...prev,
      [id]: nextFavorite,
    }));

    try {
      await toggleRestaurantFavorite(id, nextFavorite, shouldFailSimulated);
      toast.success(
        nextFavorite ? "Added to favorites!" : "Removed from favorites!",
        { id: `fav-${id}` }
      );
    } catch (err: any) {
      // Rollback on failure
      setFavorites((prev) => ({
        ...prev,
        [id]: wasFavorite,
      }));
      const message = err?.response?.data?.detail || "Failed to update favorite";
      toast.error(message, { id: `fav-${id}` });
    }
  }, [favorites]);

  return {
    favorites,
    toggleFavorite,
    isFavorite: useCallback((id: string) => !!favorites[id], [favorites]),
  };
}
