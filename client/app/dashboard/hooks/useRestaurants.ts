import { useEffect, useMemo, useState } from "react";
import type { Restaurant, RestaurantQuery, RestaurantsResponse } from "../services/restaurantsApi";
import { fetchRestaurants } from "../services/restaurantsApi";

type State = {
  data: RestaurantsResponse | null;
  loading: boolean;
  error: string | null;
};

export function useRestaurants(query: RestaurantQuery) {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });
  const [trigger, setTrigger] = useState(0);

  const stableQuery = useMemo(
    () => ({
      q: query.q || "",
      cuisine: query.cuisine || "",
      min_rating: query.min_rating ?? 0,
      sort: query.sort || "rating_desc",
      page: query.page ?? 1,
      page_size: query.page_size ?? 12,
    }),
    [query.cuisine, query.min_rating, query.page, query.page_size, query.q, query.sort],
  );

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetchRestaurants(stableQuery)
      .then((data) => {
        if (cancelled) return;
        setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err?.response?.data?.detail || err?.message || "Failed to load restaurants";
        setState({ data: null, loading: false, error: message });
      });

    return () => {
      cancelled = true;
    };
  }, [stableQuery, trigger]);

  return {
    restaurants: (state.data?.results || []) as Restaurant[],
    meta: state.data,
    loading: state.loading,
    error: state.error,
    refetch: () => setTrigger((t) => t + 1),
  };
}


