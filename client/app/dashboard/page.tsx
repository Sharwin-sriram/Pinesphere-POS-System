"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { Filter, Heart, SlidersHorizontal, AlertCircle, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import OfferBanner from "../components/dashboard/OfferBanner";
import RestaurantCard from "../components/dashboard/RestaurantCard";
import RestaurantCardSkeleton from "../components/dashboard/RestaurantCardSkeleton";
import RestaurantCardErrorBoundary from "../components/dashboard/RestaurantCardErrorBoundary";
import { useRestaurants } from "./hooks/useRestaurants";
import { useOptimisticFavorites } from "./hooks/useOptimisticFavorites";
import { debounce } from "./utils/debounce";

const CUISINES = ["All", "Italian", "Fast Food", "Biryani", "Desserts", "North Indian"];

function DashboardLandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Local state for immediate search typing, initialized from query params
  const [searchVal, setSearchVal] = useState(() => searchParams.get("q") || "");

  // Read search params directly for state selection
  const cuisine = searchParams.get("cuisine") || "All";
  const minRating = Number(searchParams.get("min_rating")) || 0;
  const sort = (searchParams.get("sort") as any) || "rating_desc";

  // Debounced URL search updates
  const debouncedUpdateUrl = useMemo(
    () =>
      debounce((val: string) => {
        const params = new URLSearchParams(window.location.search);
        if (val.trim()) {
          params.set("q", val.trim());
        } else {
          params.delete("q");
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }, 300),
    [pathname, router]
  );

  useEffect(() => {
    return () => {
      debouncedUpdateUrl.cancel();
    };
  }, [debouncedUpdateUrl]);

  // If URL changes from outside (e.g. back button), sync the local input state
  const qParam = searchParams.get("q") || "";
  useEffect(() => {
    setSearchVal(qParam);
  }, [qParam]);

  // Construct stable query object for backend call
  const query = useMemo(
    () => ({
      q: qParam,
      cuisine: cuisine === "All" ? "" : cuisine,
      min_rating: minRating || undefined,
      sort,
      page: 1,
      page_size: 12,
    }),
    [cuisine, minRating, qParam, sort]
  );

  const { restaurants, loading, error, refetch } = useRestaurants(query);
  const { favorites, toggleFavorite, isFavorite } = useOptimisticFavorites();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    debouncedUpdateUrl(val);
  };

  const handleCuisineChange = (val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val === "All" || !val) {
      params.delete("cuisine");
    } else {
      params.set("cuisine", val);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (val: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("sort", val);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleRatingChange = (val: number) => {
    const params = new URLSearchParams(window.location.search);
    if (val === 0) {
      params.delete("min_rating");
    } else {
      params.set("min_rating", String(val));
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setSearchVal("");
    router.replace(pathname, { scroll: false });
  };

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
                onChange={(e) => handleCuisineChange(e.target.value)}
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
                onChange={(e) => handleSortChange(e.target.value)}
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
                onChange={(e) => handleRatingChange(Number(e.target.value))}
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
              value={searchVal}
              onChange={handleSearchChange}
              placeholder="Search restaurants or cuisines..."
              className="h-11 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 text-[length:var(--text-sm)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-focus)]"
              aria-label="Search restaurants or cuisines"
            />
          </div>
        </div>
      </section>

      <section>
        {error ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--color-danger-subtle)] bg-[var(--color-bg-secondary)] p-8 text-center">
            <AlertCircle className="h-10 w-10 text-[var(--color-danger)] mb-3 animate-pulse" strokeWidth={1.5} />
            <h3 className="text-[length:var(--text-md)] font-semibold text-[var(--color-text-primary)]">
              Failed to load restaurants
            </h3>
            <p className="mt-1 text-[length:var(--text-sm)] text-[var(--color-text-secondary)] max-w-md">
              {error}
            </p>
            <button
              onClick={refetch}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2 text-[length:var(--text-sm)] font-semibold text-white hover:bg-[var(--color-accent-hover)] transition"
              aria-label="Retry loading restaurants"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        ) : null}

        {!error && loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        ) : null}

        {!error && !loading && restaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-12 text-center">
            <svg
              className="mx-auto h-24 w-24 text-[var(--color-text-muted)] mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-[length:var(--text-md)] font-semibold text-[var(--color-text-primary)]">
              No restaurants found
            </p>
            <p className="mt-1 text-[length:var(--text-sm)] text-[var(--color-text-secondary)] max-w-sm">
              We couldn&apos;t find any restaurants matching your filters. Try adjusting your search query or rating parameters.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-2 text-[length:var(--text-sm)] font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition"
              aria-label="Clear all filters"
            >
              Clear Filters
            </button>
          </div>
        ) : null}

        {!error && !loading && restaurants.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {restaurants.map((restaurant) => (
              <RestaurantCardErrorBoundary key={restaurant.id}>
                <div className="relative group rounded-lg focus-within:ring-2 focus-within:ring-[var(--color-border-focus)]">
                  <Link
                    href={`/dashboard/restaurant/${restaurant.id}`}
                    className="block focus:outline-none focus-visible:ring-0"
                    aria-label={`View details of ${restaurant.name}`}
                  >
                    <RestaurantCard restaurant={restaurant} />
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(restaurant.id);
                    }}
                    className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-[var(--color-text-primary)] hover:bg-white hover:scale-105 transition"
                    aria-label={isFavorite(restaurant.id) ? `Remove ${restaurant.name} from favorites` : `Add ${restaurant.name} to favorites`}
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors duration-150 ${
                        isFavorite(restaurant.id)
                          ? "fill-[var(--color-danger)] text-[var(--color-danger)]"
                          : "text-[var(--color-text-primary)]"
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>
                </div>
              </RestaurantCardErrorBoundary>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default function DashboardLanding() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-44 w-full animate-pulse rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]" />
        <div className="h-28 w-full animate-pulse rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      </div>
    }>
      <DashboardLandingContent />
    </Suspense>
  );
}


