"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Boxes, Package, RefreshCcw, Store, Truck } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import authService from "../../lib/authService";
import { fetchRestaurants } from "../../dashboard/services/restaurantsApi";
import {
  getInventoryItems,
  getLowStockItems,
  getSuppliers,
} from "../../inventory/services/inventoryApi";

type InventoryItem = {
  id: number;
  name: string;
  sku: string;
  category: string;
  current_stock: string;
  reorder_level: string;
  purchase_price: string;
  supplier?: { name: string };
};

type Supplier = {
  id: number;
  name: string;
  is_active: boolean;
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatCount(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export default function InventoryPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>("Restaurant");
  const [restaurantLookupDone, setRestaurantLookupDone] = useState(false);
  const [restaurantLookupError, setRestaurantLookupError] = useState<string | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const resolveRestaurantContext = async () => {
      try {
        const profileResult = await authService.getProfile();
        const user = profileResult.success ? profileResult.data : authService.getCurrentUser();

        const resolvedRestaurantId =
          user?.restaurant_id ??
          user?.restaurant?.id ??
          user?.restaurant?.restaurant_id ??
          user?.restaurantId;

        const resolvedRestaurantName =
          user?.restaurant_name || user?.restaurant?.name || user?.name || "Restaurant";

        if (!resolvedRestaurantId && user?.email) {
          const response = await fetchRestaurants({ page_size: 1000, sort: "name_asc" });
          const ownedRestaurant = response.results.find(
            (restaurant) => restaurant.email?.toLowerCase() === user.email.toLowerCase()
          );

          if (ownedRestaurant) {
            if (!mounted) return;
            setRestaurantId(ownedRestaurant.id);
            setRestaurantName(ownedRestaurant.name || resolvedRestaurantName);
            setRestaurantLookupDone(true);
            return;
          }
        }

        if (!mounted) return;

        if (!resolvedRestaurantId) {
          setRestaurantLookupError("Unable to load restaurant information");
          setLoading(false);
          return;
        }

        setRestaurantId(String(resolvedRestaurantId));
        setRestaurantName(resolvedRestaurantName);
      } catch {
        if (!mounted) return;
        setRestaurantLookupError("Unable to load restaurant information");
      } finally {
        if (mounted) {
          setRestaurantLookupDone(true);
        }
      }
    };

    void resolveRestaurantContext();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!restaurantLookupDone || restaurantLookupError || !restaurantId) {
      return;
    }

    let mounted = true;

    const loadInventory = async () => {
      setLoading(true);
      setError(null);

      const [itemsResult, lowStockResult, suppliersResult] = await Promise.allSettled([
        getInventoryItems(),
        getLowStockItems(),
        getSuppliers(),
      ]);

      if (!mounted) return;

      if (itemsResult.status === "fulfilled") {
        setItems(itemsResult.value);
      } else {
        setError("Failed to load inventory items");
      }

      if (lowStockResult.status === "fulfilled") {
        setLowStockItems(lowStockResult.value);
      }

      if (suppliersResult.status === "fulfilled") {
        setSuppliers(suppliersResult.value);
      }

      setLoading(false);
    };

    void loadInventory();

    return () => {
      mounted = false;
    };
  }, [restaurantLookupDone, restaurantLookupError, restaurantId]);

  const lowStockCount = lowStockItems.length || items.filter(
    (item) => Number(item.current_stock) <= Number(item.reorder_level)
  ).length;

  const estimatedValue = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.current_stock || 0) * Number(item.purchase_price || 0),
        0
      ),
    [items]
  );

  const recentItems = useMemo(() => items.slice(0, 8), [items]);

  if (restaurantLookupError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <EmptyState
          icon={Store}
          title="Inventory unavailable"
          description={restaurantLookupError}
          actionLabel="Reload"
          onAction={() => window.location.reload()}
          buttonVariant="success"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <h1 className="text-[length:var(--text-2xl)] font-semibold text-[var(--color-text-primary)]">
              {restaurantName} inventory control
            </h1>
            <p className="mt-1 text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
              Monitor stock levels, supplier coverage, and low-stock risk from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/inventory"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] transition"
            >
              Open inventory console
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Items tracked" value={formatCount(items.length)} icon={Boxes} tone="blue" />
        <MetricCard title="Low stock" value={formatCount(lowStockCount)} icon={AlertTriangle} tone="amber" />
        <MetricCard title="Active suppliers" value={formatCount(suppliers.length)} icon={Truck} tone="emerald" />
        <MetricCard title="Estimated value" value={currencyFormatter.format(estimatedValue)} icon={Package} tone="slate" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Inventory items</h2>
              <p className="text-sm text-slate-500">Current stock snapshot from the backend.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {formatCount(items.length)} total
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : recentItems.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No inventory items yet"
              description="Items from the backend will appear here once your inventory is populated."
              actionLabel="Open inventory console"
              onAction={() => window.location.assign("/inventory")}
              buttonVariant="success"
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Supplier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {recentItems.map((item) => {
                    const stock = Number(item.current_stock);
                    const reorderLevel = Number(item.reorder_level);
                    const isLowStock = stock <= reorderLevel;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-900">{item.name}</div>
                          <div className="text-xs text-slate-500">SKU {item.sku}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">{item.category}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isLowStock ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                              {stock} in stock
                            </span>
                            <span className="text-xs text-slate-400">Reorder {reorderLevel}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {item.supplier?.name || "Unassigned"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Low stock alert</h2>
                <p className="text-sm text-slate-600">Items requiring immediate replenishment.</p>
              </div>
            </div>

            {lowStockItems.length === 0 ? (
              <p className="text-sm text-slate-600">No low-stock items at the moment.</p>
            ) : (
              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-amber-100 bg-white px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.category}</p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        {Number(item.current_stock)} left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Supplier coverage</h2>
                <p className="text-sm text-slate-600">Active supply sources linked to inventory.</p>
              </div>
            </div>

            <div className="space-y-3">
              {suppliers.slice(0, 4).map((supplier) => (
                <div key={supplier.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="font-medium text-slate-900">{supplier.name}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${supplier.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                    {supplier.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}

              {suppliers.length === 0 ? (
                <p className="text-sm text-slate-500">No suppliers returned by the backend yet.</p>
              ) : null}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  icon: typeof Package;
  tone: "blue" | "amber" | "emerald" | "slate";
}) {
  const toneClasses = {
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
    emerald: "bg-emerald-100 text-emerald-700",
    slate: "bg-slate-100 text-slate-700",
  }[tone];

  return (
    <div className="rounded-3xl border border-white/70 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneClasses}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
