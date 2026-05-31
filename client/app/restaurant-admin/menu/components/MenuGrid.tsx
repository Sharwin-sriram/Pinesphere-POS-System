"use client";

import React, { useState, useEffect, useRef } from "react";
import { MoreVertical, Edit2, Trash2, Minus, Plus } from "lucide-react";
import Badge from "@/components/ui/Badge";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { MenuItem } from "../types";
import { resolveMediaUrl } from "@/components/ui/mediaUrl";

interface MenuGridProps {
  items: MenuItem[];
  onStatusToggle: (itemId: string) => void;
  onQuantityUpdate: (itemId: string, qty: number) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
}

export default function MenuGrid({
  items,
  onStatusToggle,
  onQuantityUpdate,
  onEdit,
  onDelete,
}: MenuGridProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdowns on outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleMenuClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setActiveMenuId((prev) => (prev === itemId ? null : itemId));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
      {items.map((item) => {
        const isLowStock = item.quantity <= item.low_stock_threshold;
        const isDropdownActive = activeMenuId === item.id;

        return (
          <div
            key={item.id}
            className="group relative flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden hover:border-[var(--color-border-hover)] transition-smooth hover:-translate-y-0.5"
          >
            {/* Card Header Media (16:9 aspect ratio) */}
            <div className="relative aspect-[16/9] w-full bg-[var(--color-bg-tertiary)] overflow-hidden shrink-0 flex items-center justify-center">
              <ImageWithFallback
                src={resolveMediaUrl(item.image_url)}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover h-full w-full"
              />

              {/* Status Badge Overlays */}
              <div className="absolute top-3 left-3 select-none pointer-events-none">
                <Badge
                  variant={
                    item.status === "Active"
                      ? "success"
                      : item.status === "Out of Stock"
                        ? "danger"
                        : "default"
                      }
                >
                  {item.status}
                </Badge>
              </div>

              {/* Tag Overlays (e.g. Bestseller, Veg) */}
              {item.tags && item.tags.length > 0 && (
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 select-none pointer-events-none">
                  {item.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Three-dot Actions Menu */}
              <div className="absolute top-3 right-3" ref={isDropdownActive ? dropdownRef : null}>
                <button
                  type="button"
                  onClick={(e) => handleMenuClick(e, item.id)}
                  className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-[var(--color-text-primary)] shadow-sm flex items-center justify-center transition-colors cursor-pointer border border-[var(--color-border)]"
                  title="Actions Menu"
                >
                  <MoreVertical className="h-4 w-4" strokeWidth={2} />
                </button>

                {isDropdownActive && (
                  <div className="absolute right-0 mt-1 w-28 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg shadow-lg z-30 p-1 flex flex-col">
                    <button
                      type="button"
                      onClick={() => {
                        onEdit(item);
                        setActiveMenuId(null);
                      }}
                      className="h-8 w-full rounded-md px-3 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(item.id);
                        setActiveMenuId(null);
                      }}
                      className="h-8 w-full rounded-md px-3 text-xs font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Card Body */}
            <div className="flex-1 p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] truncate">
                  {item.category}
                </span>
                <span className="text-xs font-mono font-bold text-[var(--color-text-primary)] whitespace-nowrap">
                  {item.discount_price ? formatPrice(item.discount_price) : formatPrice(item.price)}
                </span>
              </div>

              <h3
                className="text-[length:var(--text-base)] font-bold text-[var(--color-text-primary)] mt-1 truncate"
                title={item.name}
              >
                {item.name}
              </h3>

              {item.description && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              )}

              {/* Card Footer Stepper */}
              <div className="mt-auto pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[var(--color-border)] select-none">
                <div className="flex items-center border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-tertiary)] overflow-hidden h-9 shadow-inner shrink-0">
                  <button
                    type="button"
                    onClick={() => onQuantityUpdate(item.id, Math.max(0, item.quantity - 1))}
                    disabled={item.quantity <= 0}
                    className="h-full w-9 flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] active:bg-[var(--color-border)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                    title="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 0) {
                        onQuantityUpdate(item.id, val);
                      }
                    }}
                    className="w-10 h-full text-center bg-transparent border-0 font-semibold text-[var(--color-text-primary)] text-xs focus:outline-none focus:ring-0 shadow-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => onQuantityUpdate(item.id, item.quantity + 1)}
                    className="h-full w-9 flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] active:bg-[var(--color-border)] transition-colors cursor-pointer"
                    title="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                </div>

                {isLowStock && (
                  <span className="text-[10px] font-semibold text-[var(--color-danger)] uppercase tracking-wider flex items-center gap-1.5 mt-1 sm:mt-0 leading-none">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-danger)] animate-pulse" />
                    Low Stock
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
