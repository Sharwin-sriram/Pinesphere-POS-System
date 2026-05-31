"use client";

import React from "react";
import { Edit2, Trash2, Minus, Plus } from "lucide-react";
import Badge from "@/components/ui/Badge";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { MenuItem } from "../types";
import { resolveMediaUrl } from "@/components/ui/mediaUrl";

interface MenuTableProps {
  items: MenuItem[];
  selectedIds: string[];
  onSelectToggle: (itemId: string) => void;
  onSelectAllToggle: () => void;
  onStatusToggle: (itemId: string) => void;
  onQuantityUpdate: (itemId: string, qty: number) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
}

export default function MenuTable({
  items,
  selectedIds,
  onSelectToggle,
  onSelectAllToggle,
  onStatusToggle,
  onQuantityUpdate,
  onEdit,
  onDelete,
}: MenuTableProps) {
  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="w-full overflow-x-auto rounded-ds-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <table className="w-full border-collapse text-left text-[length:var(--text-base)]">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] font-semibold text-[length:var(--text-sm)] uppercase tracking-wider select-none">
            {/* Bulk Selection Checkbox */}
            <th className="py-4 px-5 w-12 text-center">
              <label className="relative flex items-center justify-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAllToggle}
                  className="peer h-4 w-4 rounded border border-[var(--color-border-strong)] bg-[var(--color-bg-secondary)] text-[var(--color-accent-green)] transition-smooth focus:outline-none focus:ring-0"
                />
              </label>
            </th>
            <th className="py-4 px-4 w-20">Image</th>
            <th className="py-4 px-4 min-w-[200px]">Item Name</th>
            <th className="py-4 px-4">Category</th>
            <th className="py-4 px-4 text-right">Price</th>
            <th className="py-4 px-4 text-center min-w-[150px]">Quantity / Stock</th>
            <th className="py-4 px-4 text-center">Status</th>
            <th className="py-4 px-4 text-center w-28">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {items.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const isLowStock = item.quantity <= item.low_stock_threshold;

            return (
              <tr
                key={item.id}
                className={`transition-colors duration-150 hover:bg-[var(--color-bg-primary)] ${
                  isSelected ? "bg-[var(--color-accent-green-subtle)]/10" : ""
                }`}
              >
                {/* Checkbox Selector */}
                <td className="py-4 px-5 text-center">
                  <label className="relative flex items-center justify-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectToggle(item.id)}
                      className="peer h-4 w-4 rounded border border-[var(--color-border-strong)] bg-[var(--color-bg-secondary)] text-[var(--color-accent-green)] transition-smooth focus:outline-none focus:ring-0"
                    />
                  </label>
                </td>

                {/* Thumbnail Image */}
                <td className="py-4 px-4">
                  <div className="relative h-12 w-12 rounded-lg border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-tertiary)] shrink-0 flex items-center justify-center">
                    <ImageWithFallback
                      src={resolveMediaUrl(item.image_url)}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="object-cover h-full w-full"
                    />
                  </div>
                </td>

                {/* Item Name (truncated with tooltip) */}
                <td className="py-4 px-4 font-semibold text-[var(--color-text-primary)]">
                  <div className="max-w-[280px] truncate" title={item.name}>
                    {item.name}
                  </div>
                  {item.description && (
                    <div className="max-w-[280px] truncate text-xs font-normal text-[var(--color-text-muted)] mt-0.5">
                      {item.description}
                    </div>
                  )}
                </td>

                {/* Category Badge */}
                <td className="py-4 px-4">
                  <Badge variant="accent">{item.category}</Badge>
                </td>

                {/* Right Aligned Price */}
                <td className="py-4 px-4 text-right font-semibold text-[var(--color-text-primary)] font-mono">
                  {item.discount_price ? (
                    <div className="flex flex-col items-end">
                      <span className="text-[var(--color-accent-green)]">{formatPrice(item.discount_price)}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)] line-through">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  ) : (
                    <span>{formatPrice(item.price)}</span>
                  )}
                </td>

                {/* Inline Stepper Quantity */}
                <td className="py-4 px-4">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="flex items-center border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-tertiary)] overflow-hidden h-9 shadow-inner select-none">
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
                        className="w-12 h-full text-center bg-transparent border-0 font-semibold text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-0 shadow-none font-mono"
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

                    {/* Low stock warning */}
                    {isLowStock && (
                      <span className="text-[10px] font-semibold text-[var(--color-danger)] uppercase tracking-wider flex items-center gap-1 leading-none select-none">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-danger)] animate-pulse" />
                        Low Stock
                      </span>
                    )}
                  </div>
                </td>

                {/* Optimistic Status Toggle Badge */}
                <td className="py-4 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => onStatusToggle(item.id)}
                    className="focus:outline-none cursor-pointer active:scale-95 transition-transform"
                    title={`Click to toggle: ${item.status === "Active" ? "Deactivate" : "Activate"}`}
                  >
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
                  </button>
                </td>

                {/* Edit / Delete Action Buttons */}
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-tertiary)] transition-smooth flex items-center justify-center shrink-0 cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit2 className="h-4.5 w-4.5" strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] hover:border-red-200 transition-smooth flex items-center justify-center shrink-0 cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="h-4.5 w-4.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
