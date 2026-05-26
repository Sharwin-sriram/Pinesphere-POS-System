"use client";

import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Input({ label, className = "", ...props }: Props) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-2 block text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)]">
          {label}
        </span>
      ) : null}
      <input
        className={`h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 text-[length:var(--text-base)] text-[var(--color-text-primary)] transition duration-150 placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] focus:outline-none ${className}`}
        {...props}
      />
    </label>
  );
}
