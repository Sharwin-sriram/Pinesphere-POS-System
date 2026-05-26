"use client";

import { useMemo, useState } from "react";
import { Filter, Heart, SlidersHorizontal } from "lucide-react";
import OfferBanner from "../components/dashboard/OfferBanner";
import RestaurantCard from "../components/dashboard/RestaurantCard";
import RestaurantCardSkeleton from "../components/dashboard/RestaurantCardSkeleton";
import { useRestaurants } from "./hooks/useRestaurants";

const CUISINES = ["All", "Italian", "Fast Food", "Biryani", "Desserts", "North Indian"];

export default function DashboardLanding() {
  const [q, setQ] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<"rating_desc" | "delivery_asc" | "name_asc">("rating_desc");

  const query = useMemo(
    () => ({
      q,
      cuisine: cuisine === "All" ? "" : cuisine,
      min_rating: minRating || undefined,
      sort,
      page: 1,
      page_size: 12,
    }),
    [cuisine, minRating, q, sort],
  );

  const { restaurants, loading, error } = useRestaurants(query);

  return (
    <div className="space-y-6">
      <OfferBanner />

      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <h1 className="text-[length:var(--text-xl)] font-semibold text-[var(--color-text-primary)]">
              Restaurants near you
            </h1>
            <p className="mt-1 text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
              Browse top rated places, offers, and fast delivery.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" strokeWidth={1.5} />
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] pl-10 pr-3 text-[length:var(--text-sm)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-focus)] sm:w-48"
                aria-label="Filter by cuisine"
              >
                {CUISINES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" strokeWidth={1.5} />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] pl-10 pr-3 text-[length:var(--text-sm)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-focus)] sm:w-52"
                aria-label="Sort restaurants"
              >
                <option value="rating_desc">Top rated</option>
                <option value="delivery_asc">Fastest delivery</option>
                <option value="name_asc">Name (A–Z)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2">
              <span className="text-[length:var(--text-xs)] text-[var(--color-text-muted)]">Min rating</span>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-28 accent-[var(--color-accent)]"
                aria-label="Minimum rating"
              />
              <span className="text-[length:var(--text-xs)] font-semibold text-[var(--color-text-primary)]">{minRating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search restaurants or cuisines..."
              className="h-11 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 text-[length:var(--text-sm)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-focus)]"
            />
          </div>
        </div>
      </section>

      <section>
        {error ? (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 text-[length:var(--text-sm)] text-[var(--color-danger)]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-10 text-center">
            <p className="text-[length:var(--text-md)] font-semibold text-[var(--color-text-primary)]">No restaurants found</p>
            <p className="mt-1 text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
              Try a different search or clear your filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="relative">
                <RestaurantCard restaurant={restaurant} />
                <button
                  className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-[var(--color-text-primary)] hover:bg-white transition"
                  aria-label="Favorite restaurant"
                >
                  <Heart className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

