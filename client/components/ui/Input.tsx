"use client"
import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  description?: string
  error?: string
  success?: string
  inputClassName?: string
}

export default function Input({
  label,
  description,
  error,
  success,
  className = '',
  inputClassName = '',
  ...props
}: Props) {
  // DS: color — token borders; DS: shadow — no focus ring glow
  const stateClasses = error
    ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)]'
    : success
      ? 'border-[var(--color-success)] focus:border-[var(--color-success)]'
      : 'border-[var(--color-border)] focus:border-[var(--color-border-focus)]'

  const helperText = error || success || description
  const helperTone = error
    ? 'text-[var(--color-danger)]'
    : success
      ? 'text-[var(--color-success)]'
      : 'text-[var(--color-text-muted)]'

  return (
    <label className={`block text-[length:var(--text-sm)] text-[var(--color-text-secondary)] ${className}`}>
      {label ? (
        <div className="mb-2 font-medium text-[var(--color-text-secondary)]">{label}</div>
      ) : null}
      <input
        aria-invalid={Boolean(error)}
        className={`h-10 w-full rounded-md border bg-[var(--color-bg-tertiary)] px-4 text-[length:var(--text-base)] text-[var(--color-text-primary)] caret-[var(--color-accent)] transition duration-150 placeholder:text-[var(--color-text-muted)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${stateClasses} ${inputClassName}`}
        {...props}
      />
      {helperText ? (
        <p className={`mt-2 text-[length:var(--text-sm)] leading-[var(--leading-normal)] ${helperTone}`}>
          {helperText}
        </p>
      ) : null}
    </label>
  )
}
