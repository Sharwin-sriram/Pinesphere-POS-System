"use client";

import { use, useEffect, useState, useMemo, useRef } from "react";

import { ArrowLeft, Clock, MapPin, Star, AlertCircle, RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  fetchRestaurantById,
  fetchRestaurantMenu,
  Restaurant,
  MenuItem,
} from "../../services/restaurantsApi";
import { useCart } from "../../../components/dashboard/CartContext";
import { debounce } from "../../utils/debounce";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RestaurantDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Parallel data states
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Loader states
  const [resLoading, setResLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(true);

  // Error states
  const [resError, setResError] = useState<string | null>(null);
  const [menuError, setMenuError] = useState<string | null>(null);

  // Force refetch trigger count
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Fetch restaurant metadata & menu in parallel
  useEffect(() => {
    setResLoading(true);
    setMenuLoading(true);
    setResError(null);
    setMenuError(null);

    fetchRestaurantById(id)
      .then((data) => {
        setRestaurant(data);
        setResLoading(false);
      })
      .catch((err) => {
        const msg = err?.response?.data?.detail || err?.message || "Failed to load restaurant details";
        setResError(msg);
        setResLoading(false);
      });

    fetchRestaurantMenu(id)
      .then((data) => {
        setMenuItems(data);
        setMenuLoading(false);
      })
      .catch((err) => {
        const msg = err?.response?.data?.detail || err?.message || "Failed to load menu items";
        setMenuError(msg);
        setMenuLoading(false);
      });
  }, [id, retryTrigger]);

  // Search filter local & debounced states
  const [menuSearchVal, setMenuSearchVal] = useState("");
  const [debouncedMenuSearch, setDebouncedMenuSearch] = useState("");

  const updateDebouncedSearch = useMemo(
    () => debounce((val: string) => setDebouncedMenuSearch(val), 300),
    []
  );

  const handleMenuSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMenuSearchVal(val);
    updateDebouncedSearch(val);
  };

  useEffect(() => {
    return () => {
      updateDebouncedSearch.cancel();
    };
  }, [updateDebouncedSearch]);

  // Filtered menu items based on client-side search
  const filteredMenuItems = useMemo(() => {
    if (!debouncedMenuSearch.trim()) return menuItems;
    const query = debouncedMenuSearch.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }, [menuItems, debouncedMenuSearch]);

  // Extract unique categories from search result menu items
  const categories = useMemo(() => {
    const list: string[] = [];
    filteredMenuItems.forEach((item) => {
      if (!list.includes(item.category)) {
        list.push(item.category);
      }
    });
    return list;
  }, [filteredMenuItems]);

  // IntersectionObserver setup for category pill sync
  const [activeCategory, setActiveCategory] = useState("");
  const isClickScrollingRef = useRef(false);

  useEffect(() => {
    if (categories.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px", // Snaps active pill when category header enters top section of window
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (isClickScrollingRef.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const categoryName = entry.target.id.replace("category-section-", "");
          setActiveCategory(categoryName);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    categories.forEach((cat) => {
      const el = document.getElementById(`category-section-${cat}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  const handleCategoryClick = (category: string) => {
    const element = document.getElementById(`category-section-${category}`);
    if (element) {
      isClickScrollingRef.current = true;
      setActiveCategory(category);
      // Offset scroll by header height (approx 120px) to prevent sticky header overlays
      const yOffset = -130; 
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });

      setTimeout(() => {
        isClickScrollingRef.current = false;
      }, 800);
    }
  };

  const handleRetry = () => {
    setRetryTrigger((t) => t + 1);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Header Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-full hover:bg-[var(--color-bg-tertiary)] hover:scale-105 transition"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4 text-[var(--color-text-primary)]" strokeWidth={1.5} />
        </button>
        <span className="text-[length:var(--text-sm)] text-[var(--color-text-secondary)] font-medium">
          Back to Dashboard
        </span>
      </div>

      {/* Restaurant Meta (Hero) Loaders/Errors */}
      {resError ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--color-danger-subtle)] bg-[var(--color-bg-secondary)] p-8 text-center">
          <AlertCircle className="h-10 w-10 text-[var(--color-danger)] mb-3" />
          <h3 className="text-[length:var(--text-md)] font-semibold text-[var(--color-text-primary)]">
            Failed to load restaurant details
          </h3>
          <p className="mt-1 text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
            {resError}
          </p>
          <button
            onClick={handleRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2 text-[length:var(--text-sm)] font-semibold text-white hover:bg-[var(--color-accent-hover)] transition"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      ) : resLoading ? (
        <div className="h-64 md:h-80 w-full animate-pulse rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]" />
      ) : restaurant ? (
        /* Hero Section */
        <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-xl bg-slate-100 border border-[var(--color-border)]">
          {restaurant.image_url ? (
            <Image
              src={restaurant.image_url}
              alt={`${restaurant.name} banner`}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {restaurant.cuisine.map((c) => (
                  <span key={c} className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
                    {c}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight">{restaurant.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-200">
                <div className="flex items-center gap-1 bg-emerald-500/90 text-white px-2 py-0.5 rounded font-semibold text-xs">
                  <span>{restaurant.rating.toFixed(1)}</span>
                  <Star className="h-3 w-3 fill-white" />
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" strokeWidth={1.5} />
                  <span>{restaurant.delivery_time_min} mins</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" strokeWidth={1.5} />
                  <span>{restaurant.location}</span>
                </div>
                <span>•</span>
                <span>Min Order: ₹{restaurant.min_order_amount}</span>
              </div>
            </div>

            <div className="flex gap-2 shrink-0 md:mb-1">
              {restaurant.offer_text && (
                <span className="rounded bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                  {restaurant.offer_text}
                </span>
              )}
              <span className={`rounded px-3 py-1 text-xs font-bold shadow-md ${
                restaurant.is_open ? "bg-emerald-500 text-white" : "bg-slate-700 text-white"
              }`}>
                {restaurant.is_open ? "OPEN" : "CLOSED"}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Menu / Categories List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Sticky category navbar & Search input */}
        <div className="lg:col-span-1 lg:sticky lg:top-20 z-20 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" strokeWidth={1.5} />
            <input
              value={menuSearchVal}
              onChange={handleMenuSearchChange}
              placeholder="Search in menu..."
              className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] pl-10 pr-3 text-[length:var(--text-sm)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-focus)]"
              aria-label="Search menu items"
            />
          </div>

          {categories.length > 0 && (
            <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 pb-2 lg:pb-0 border-b lg:border-b-0 border-[var(--color-border)] no-scrollbar" aria-label="Menu categories">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`text-left shrink-0 px-3 py-2 rounded-md text-[length:var(--text-xs)] font-semibold transition ${
                    activeCategory === cat
                      ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent-hover)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Right Side: Menu Items Grid */}
        <div className="lg:col-span-3">
          {menuError ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--color-danger-subtle)] bg-[var(--color-bg-secondary)] p-8 text-center">
              <AlertCircle className="h-10 w-10 text-[var(--color-danger)] mb-3" />
              <h3 className="text-[length:var(--text-md)] font-semibold text-[var(--color-text-primary)]">
                Failed to load menu items
              </h3>
              <p className="mt-1 text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
                {menuError}
              </p>
              <button
                onClick={handleRetry}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2 text-[length:var(--text-sm)] font-semibold text-white hover:bg-[var(--color-accent-hover)] transition"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          ) : menuLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-5 w-32 animate-pulse rounded bg-[var(--color-bg-secondary)]" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 2 }).map((_, j) => (
                      <div key={j} className="h-28 animate-pulse rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-12 text-center">
              <p className="text-[length:var(--text-md)] font-semibold text-[var(--color-text-primary)]">
                No items found
              </p>
              <p className="mt-1 text-[length:var(--text-sm)] text-[var(--color-text-secondary)] max-w-sm">
                No items in the menu matched &apos;{menuSearchVal}&apos;. Try searching for something else.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {categories.map((category) => {
                const items = filteredMenuItems.filter((item) => item.category === category);
                return (
                  <section
                    key={category}
                    id={`category-section-${category}`}
                    className="space-y-4 scroll-mt-24"
                  >
                    <h2 className="text-[length:var(--text-md)] font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
                      {category} ({items.length})
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                      {items.map((item) => (
                        <MenuItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuItemCard({ item }: { item: MenuItem }) {
  const [expanded, setExpanded] = useState(false);
  const { cartItems, addToCart, updateQuantity } = useCart();

  // Check if item is already in the cart
  const cartItem = cartItems.find((i) => i.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image_url || undefined,
    });
  };

  const handleIncrement = () => {
    updateQuantity(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(item.id, quantity - 1);
  };

  return (
    <div className="flex gap-4 p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-secondary)] hover:border-[var(--color-border-hover)] transition-smooth">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center justify-center border h-4 w-4 shrink-0 rounded-[2px] p-[2px] ${
              item.is_veg ? "border-emerald-600" : "border-red-600"
            }`}
            title={item.is_veg ? "Veg" : "Non-Veg"}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                item.is_veg ? "bg-emerald-600" : "bg-red-600"
              }`}
            />
          </span>
          <h3 className="font-semibold text-[length:var(--text-base)] text-[var(--color-text-primary)] truncate">
            {item.name}
          </h3>
        </div>
        <div className="mt-1 flex flex-col gap-0.5">
          {item.discount_price ? (
            <>
              <p className="font-semibold text-[length:var(--text-sm)] text-[var(--color-accent)]">
                {formatCurrency(item.discount_price)}
              </p>
              <p className="text-[10px] font-medium text-[var(--color-text-muted)] line-through">
                {formatCurrency(item.price)}
              </p>
            </>
          ) : (
            <p className="font-semibold text-[length:var(--text-sm)] text-[var(--color-text-primary)]">
              {formatCurrency(item.price)}
            </p>
          )}
        </div>
        <div className="mt-2">
          <p className={`text-[length:var(--text-xs)] text-[var(--color-text-secondary)] leading-relaxed ${
            expanded ? "" : "line-clamp-2"
          }`}>
            {item.description}
          </p>
          {item.description.length > 80 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-[10px] font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition"
              aria-expanded={expanded}
            >
              {expanded ? "Read Less" : "Read More"}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center shrink-0">
        <div className="relative h-24 w-24 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)]">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--color-text-muted)] text-[10px]">
              No Image
            </div>
          )}
        </div>

        <div className="mt-2 -translate-y-4">
          {quantity > 0 ? (
            <div className="flex items-center gap-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] px-2.5 py-1 rounded-md shadow-sm">
              <button
                onClick={handleDecrement}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-bold text-sm px-1.5 focus:outline-none"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="font-semibold text-xs text-[var(--color-text-primary)] min-w-[12px] text-center">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-bold text-sm px-1.5 focus:outline-none"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] px-5 py-1 rounded-md text-xs font-bold text-[var(--color-success)] shadow-sm hover:bg-[var(--color-bg-tertiary)] transition"
              aria-label={`Add ${item.name} to cart`}
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
