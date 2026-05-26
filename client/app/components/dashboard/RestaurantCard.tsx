"use client";

import { Clock, MapPin, Star } from "lucide-react";
import Image from "next/image";
import type { Restaurant } from "../../dashboard/services/restaurantsApi";

export default function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] transition duration-150 hover:-translate-y-0.5 hover:border-[var(--color-border-hover)]">
      <div className="relative h-40 w-full bg-[var(--color-bg-tertiary)]">
        {restaurant.image_url ? (
          <Image
            src={restaurant.image_url}
            alt={`${restaurant.name} banner`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-250 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <div className="min-w-0">
            {restaurant.offer_text ? (
              <span className="inline-flex rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-[var(--color-text-primary)]">
                {restaurant.offer_text}
              </span>
            ) : null}
          </div>
          <span
            className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
              restaurant.is_open ? "bg-emerald-500/90 text-white" : "bg-slate-900/70 text-white"
            }`}
          >
            {restaurant.is_open ? "Open" : "Closed"}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[length:var(--text-md)] font-semibold text-[var(--color-text-primary)]">
              {restaurant.name}
            </h3>
            <p className="mt-1 line-clamp-1 text-[length:var(--text-xs)] text-[var(--color-text-secondary)]">
              {restaurant.cuisine.join(", ")}
            </p>
          </div>

          <div className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-2 py-1 text-[length:var(--text-xs)] text-[var(--color-text-primary)]">
            <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
            <Star className="h-4 w-4 text-[var(--color-accent)]" strokeWidth={1.5} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-[length:var(--text-xs)] text-[var(--color-text-muted)]">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" strokeWidth={1.5} />
            {restaurant.delivery_time_min} min
          </span>
          <span className="inline-flex items-center gap-1 truncate">
            <MapPin className="h-4 w-4" strokeWidth={1.5} />
            {restaurant.location}
          </span>
          <span className="text-[var(--color-text-secondary)]">Min ₹{restaurant.min_order_amount}</span>
        </div>
      </div>
    </article>
  );
}

