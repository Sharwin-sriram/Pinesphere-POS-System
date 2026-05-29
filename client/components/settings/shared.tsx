"use client";

import React from "react";
import { colorSwatches } from "@/lib/validators/settings";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export function ColorSwatchPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {colorSwatches.map((swatch) => (
        <button
          key={swatch}
          type="button"
          onClick={() => onChange(swatch)}
          className={`h-8 rounded-md border ${value === swatch ? "border-[var(--color-border-focus)] ring-2 ring-[var(--color-border-focus)]/20" : "border-[var(--color-border)]"}`}
          style={{ backgroundColor: swatch }}
          aria-label={`Select color ${swatch}`}
        />
      ))}
      <div className="col-span-6 mt-2">
        <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="#0f172a" />
      </div>
    </div>
  );
}

export function WeekdayHoursEditor({
  value,
  onChange,
}: {
  value: Array<{ day: number; closed: boolean; open: string | null; close: string | null }>;
  onChange: (next: Array<{ day: number; closed: boolean; open: string | null; close: string | null }>) => void;
}) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-3">
      {days.map((label, index) => {
        const entry = value[index] || { day: index, closed: false, open: "09:00", close: "22:00" };
        return (
          <div key={label} className="grid grid-cols-12 items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-3">
            <div className="col-span-2 text-sm font-medium text-[var(--color-text-primary)]">{label}</div>
            <label className="col-span-2 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                checked={entry.closed}
                onChange={(event) => {
                  const next = [...value];
                  next[index] = { ...entry, closed: event.target.checked };
                  onChange(next);
                }}
              />
              Closed
            </label>
            <div className="col-span-4">
              <Input
                type="time"
                value={entry.open || "09:00"}
                onChange={(event) => {
                  const next = [...value];
                  next[index] = { ...entry, open: event.target.value };
                  onChange(next);
                }}
                disabled={entry.closed}
              />
            </div>
            <div className="col-span-4">
              <Input
                type="time"
                value={entry.close || "22:00"}
                onChange={(event) => {
                  const next = [...value];
                  next[index] = { ...entry, close: event.target.value };
                  onChange(next);
                }}
                disabled={entry.closed}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function WeekdayMultiSelect({ value, onChange }: { value: number[]; onChange: (value: number[]) => void }) {
  const options = [
    { label: "Mon", value: 0 },
    { label: "Tue", value: 1 },
    { label: "Wed", value: 2 },
    { label: "Thu", value: 3 },
    { label: "Fri", value: 4 },
    { label: "Sat", value: 5 },
    { label: "Sun", value: 6 },
  ];

  return (
    <div className="grid grid-cols-7 gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(value.includes(option.value) ? value.filter((item) => item !== option.value) : [...value, option.value])}
          className={`rounded-md border px-3 py-2 text-sm font-medium transition-smooth ${
            value.includes(option.value)
              ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
              : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function SimpleToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm text-[var(--color-text-primary)]">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}
